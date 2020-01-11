const margin = { top:40, right:20, bottom:50, left:100 }; //so we have room for axes and other elements

//graph width and height
const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 350 - margin.top - margin.bottom;

//create svg container
const svg = d3.select('.canvas')
              .append('svg')  //so 560px but we don't want to hardcode it (makes changes easier)
              .attr('width', graphWidth + margin.left + margin.right)
              .attr('height', graphHeight + margin.top + margin.top);

const graph = svg.append('g')//append a group
                  .attr('width', graphWidth)
                  .attr('height', graphHeight)
                                      //move graph by 100px from left and 40px down from top
                  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// scales
 //buitin d3 func that
const x = d3.scaleTime().range([0,graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);


//axes groups
const xAxisGroup = graph.append('g')//just to contain all axes shapes
                        .attr('class', 'x-axis')//for styling later on
                        .attr('transform', `translate(0, ${graphHeight})`);//by default it will start at pos 0 (top of graph)

const yAxisGroup = graph.append('g')
                        .attr('class', 'y-axis');


// d3 line path generator: connecting the points
const line = d3.line() //buitin d3 func that needs two params .x and .y
                //looks at x coor for line
                .x(function(d) { return x(new Date(d.date)) })
                .y(function(d) { return y(d.distance) });

// line path element
const path = graph.append('path');

// create dotted line group and append to graph

const dottedLines = graph.append('g')
                         .attr('class', 'lines')
                         .style('opacity', 0);

// create x dotted line and append to dotted line group

const xDottedLine = dottedLines.append('line')
                               .attr('stroke', '#aaa')
                               .attr('stroke-width', 1)
                               .attr('stroke-dasharray', 4) //-dasharray is to make the dashed look

// create y dotted line and append to dotted line group

const yDottedLine = dottedLines.append('line')
                               .attr('stroke', '#aaa')
                               .attr('stroke-width', 1)
                               .attr('stroke-dasharray', 4)

const update = (data) => { //look through all of the data

  //filter data by using the activity var in index.js
                            //item.activity: what is currently on the graph
                                              //what var activity is right now. If same don't filter otherwise, do filter
                                              //match whatever is in array for that item.activity
  data = data.filter(item => item.activity == activity);

  //sort data based on date objects: To draw lines correctly
  //Using JS's sort method
      //a and b are two consec elements and we are comparing them both
      //if it's a negative date b is larger (later date) than a and vice versa
  data.sort((a,b)=> new Date(a.date) - new Date(b.date));


  //set scale domains
                                    //pass in the previously saved string to a new data object for comparison
                                    // will return domain in array as [earliest date, latest date]
  x.domain(d3.extent(data, d => new Date(d.date)));
            // from 0 to max distance
                      //first arg: data we want to look through
                            //for each object look at the distance
  y.domain([0, d3.max(data, d => d.distance)]);


  //update path data
  path.data([data])//expects our data in an array so must use []s (even though) our data is already an array
      .attr('fill', 'none')
      .attr('stroke', 'grey')
      .attr('stroke-width', 2)
      .attr('d', line);

  // create circles for objects
  const circles = graph.selectAll('circle')
                       .data(data);

  //Exit selection: remove unwanted points
  circles.exit().remove();

  // Update selection: update new points
  circles.attr('cx', d => x(new Date(d.date)))
         .attr('cy', d => y(d.distance));

  // Enter selection: add new points
  circles.enter()
         .append('circle')
          .attr('r', 6) //radius of 4px
          .attr('cx', d => x(new Date(d.date))) //in firestore date is the property
                                                //so, take in the date string pass it through the Date func and then pass it through
                                                // the x func, which is range bounded from 0, graphWidth
          .attr('cy', d => y(d.distance))
          .attr('fill', '#00bfa5');

  graph.selectAll('circle')
       .on('mouseover', (d, i, n) => {
         d3.select(n[i])//select the circle we are hovering over
           .transition().duration(150)
                .attr('r', 10)
                .attr('fill', 'white')
        // set x dotted line cords (x1, x2, y1, y2)
        xDottedLine
          .attr('x1', x(new Date(d.date))) // x1 and x2 are the same
          .attr('x2', x(new Date(d.date)))
          .attr('y1', graphHeight) // bottom of the graph (bottom of the line)
          .attr('y2', y(d.distance)); //y-val of the circle
        // set y dotted line cords (x1, x2, y1, y2)
        yDottedLine
          .attr('x1', 0)
          .attr('x2', x(new Date(d.date)))
          .attr('y1', y(d.distance)) //both y1 and y2 are at circle height on graph
          .attr('y2', y(d.distance));

        // show the dotted line group (.style, opacity)
        dottedLines.style('opacity', 1); //make it visible by making if fully opaque

       })
        .on('mouseleave', (d, i, n) => {
          d3.select(n[i])//select the circle we are hovering over
            .transition().duration(1000)
                 .attr('r', 6)
                 .attr('fill', '#00bfa5')

          // hide the dotted line group (.style, opacity)
          dottedLines.transition().duration(1000)
                      .style('opacity', 0); //make it dissapear by making it fully transparent
        })

  //create axes
  const xAxis = d3.axisBottom(x) //make an axis based on x time scale above
                  .ticks(4) //provide four ticks
                  .tickFormat(d3.timeFormat('%b %d')); //This is to format tick in just %b (abr month) and %d (abr date)
                                                      //otherwise it will just show the time, which is not entirely helpful for weekly activity
  const yAxis = d3.axisLeft(y)
                  .ticks(4)
                  .tickFormat(d => d + " meters");

  // call axes: takes axes and creates the shapes inside the different groups
  xAxisGroup.call(xAxis);//will generate all shapes for xAxis and place them in the xAxis group
  yAxisGroup.call(yAxis);

  //rotate axis text
  xAxisGroup.selectAll('text')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end')

};


// data and firestore
var data = [];
db.collection('activites').onSnapshot(res => {
  res.docChanges().forEach(change => {

    // cycle through all the data and grab all the user added info and the doc id
    const doc = {...change.doc.data(), id: change.doc.id};

    //switch case: look at a variable, determine it's change type and then
    // decide if it should be added, modified, or removed from the collection
    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified': //if doc id is the same of the item, then make that data (using the index)
                      // the new doc (at that index location)
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
      }
  });
  update(data)
});
