//Declaring my form as a variable
const form = document.getElementById("entry-form")

//Adding an event listener to the submit button on the form
document.getElementById("entry-form").addEventListener("submit", async (event) => {
  
  //This stops the submit from executing its default event, which allows
  //me to use async functions 
  event.preventDefault()

  //Declaring a FormData object with the contents of my form
  const entry = new FormData(form)

  //Calling my postEntry method with the entry as a parameter
  postEntry(entry)
})

const postEntry = async (entry) => {  
  //fetching the post method from my API and giving the entry as a body
  fetch("/", {
    // headers: {"Content-type": "application/json; charset=UTF-8"},
    method: "post",
    body: entry,
  })
  .then((res) => {
    //Checking if I get a response 
    if (res === undefined) {
      console.log("ERROR: Got an undefined response");
    } else if (res.status === 201){
      
      //If I get this then all should have worked and the entry posted
      console.log("Sent and posted!")

      //This resets the URL to the root of the page
      window.location.assign(location.origin)
    } else {
      //This should only happen if an error is caught in the router
      console.log("ERROR: ", res.status);
    }
  })
}
