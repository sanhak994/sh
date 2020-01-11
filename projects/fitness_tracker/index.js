const btns = document.querySelectorAll('button');
const form = document.querySelector('form');
const formAct = document.querySelector('form span');//span tag inside the form tag
const input = document.querySelector('input');
const error = document.querySelector('.error'); //the p tag

var activity = 'cycling';

// for each button do the activities below
btns.forEach(btn => {
  btn.addEventListener('click', e => {
    // get activity, b/c in the html, we used data-activity, we can use target.dataset.activity
    activity = e.target.dataset.activity;

    // remove and add active class
                                      //if they have the active class list remove it
    btns.forEach(btn => btn.classList.remove('active'));

    // add active if they don't have it
    e.target.classList.add('active');

    //set id of input field
    input.setAttribute('id', activity)

    //set text of form span
    formAct.textContent = activity;

    //call update func to redraw graph (filter data to selected category)
    update(data);

  })
});

// form submit: get firestore to create a new collection and add a doc to that collection

form.addEventListener('submit', e => {
  //prevent default action: don't want it to reload the page upon submit
  e.preventDefault()

  const distance = parseInt(input.value); //convert strings to integers

  if (distance){ //make sure that a value is entered so we don't just send null to the database
    db.collection('activites').add({
      distance,    // ES6 makes this simpler, we're actually
      activity,   // entering in distance: distance but we can shorten it if they're the same
      date: new Date().toString()//just so we don't confuse it with firebase's default timestamp feature
    }).then(() => {
      error.textContent = '';//reset error value
      input.value = '';
    })
  } else { //if they try to submit a blank entry
    error.textContent = 'Please enter a valid distance'
  }
});
