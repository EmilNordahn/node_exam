//First I get my wrapper from the html
const entriesWrapperDiv = document.getElementById("entries-wrapper")
const empty = document.querySelector(".empty")

//Fetching entries from the my API
const getNextEntries = async () => {

  fetch(`entries/`)
  //Return a promise that my async will respond with a JSON
  .then( res =>  res.json())
  //Then returning a promise that my async will return a JSON called 'entries'
  .then(( {response} ) => {

    //Remove event listener if there are no more entries
    if ( response.entries.length < 1 ) {
      empty.classList.add("active")
      entriesWrapperDiv.removeEventListener("scroll", handleScroll)
    }

    //for every field (entry) in the entries object
    response.entries.forEach( entry => {
      //I create a new div to wrap around each entry
      const entryDiv = document.createElement("div")
      //I add some classes to the new div, this allows me to manipulate them with CSS
      entryDiv.classList.add("post-container", "w3-round-xlarge", "darker-bg")


      //Declaring the contents of the div
      entryDiv.innerHTML = `
        <div>
          <div class="entry-title">
            <h1 class="entry-text">${entry.title}<h1>
          </div>
            <p class="entry-text" style="font-size: large;">${entry.content}<p>
            <p class="time-stamp">${entry.timeStamp}</p>
        </div>
        <div class="score-container">
          <div>
            <img src="/styling/icons/undecided.png" width="50px" height="50px"></img>
          </div>
          <h3>${entry.score}</h3>
          <div>
            <img src="/styling/icons/undecided.png" style="transform: rotate(180deg)" width="50px" height="50px"></img>
          </div>
        </div>
    `
    //Finally adding the div to my wrapper
    entriesWrapperDiv.appendChild(entryDiv)
    })
  })  
}

//Initial load of entries right after DOM has loaded
window.addEventListener("DOMContentLoaded", () => getNextEntries())

//This function fires calculates whether the user has scrolled to the bottom
//of the entry container
const handleScroll = () => {
  let triggerHeight = entriesWrapperDiv.scrollTop + entriesWrapperDiv.offsetHeight
  if (triggerHeight >= entriesWrapperDiv.scrollHeight) {
    getNextEntries()
  }
}

//Adding event listener to the container
entriesWrapperDiv.addEventListener("scroll", handleScroll)

//This function makes the modal close if the user clicks outside it
const modal = document.getElementById("create-new-entry")

window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none"
  }
}
