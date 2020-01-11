// interacting with DOM, sending data to firebase, and such
const form = document.querySelector('form');//grab the form element
const name = document.querySelector('#name'); //grab the item name input field
const cost = document.querySelector('#cost'); //grab the cost input field
const error = document.querySelector('#error');

//Attach event listner to form: check to see if add item button has been clicked
                    //even of type 'submit'
                              //fires off this func when even type 'submit' is activated
form.addEventListener('submit', (e) => { //e is the 'submit' event

  //by default it refreshes page, which we want to prevent
  e.preventDefault();

  // If name and cost has a value (will return true)
  if (name.value && cost.value){

    // create a place to store the new values
    const item = {
      name: name.value,
      cost: parseInt(cost.value), //This must be converted from string to integers, which is why we use parseInt
    };

     //Then we go to the our firebase collection to add the new doc from above (the saved 'item')
     db.collection('expenses').add(item).then(res => { //use .then to get the promise back from firebase
                                                      //define a new var, to then just reset the values entered into 'item'

      error.textContent=''; //get rid of the error, otherwise it'll just stick there
      name.value = ''; //Just set to these as empty strings again after we get the promise back from firebase
      cost.value = '';

     })

  } else {
    //use the error p tag
    error.textContent = 'Please enter values before submitting';
  }
});
