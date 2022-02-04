//Import the fs in order to read files 
const fs = require("fs")

//Assigning my header and footer to variables, this makes it easier to read IMO
//I can declare these in the topmost scope as they will always have the same paths
const fragmentPath = "./public/views/fragments/"

const header = fs.readFileSync(fragmentPath + "header/header.html")
const footer = fs.readFileSync(fragmentPath + "footer/footer.html")
const chatLogin = fs.readFileSync(fragmentPath + "chat/login-chat.html")
const chat = fs.readFileSync(fragmentPath + "chat/chat.html")

//Declare my assemblePage function, with a path and optionals as parameters
function assemblePage( path, optionals ) {

  //Assignigning the given html file to a variable (again for readability)
  const page = fs.readFileSync(`./public/views/${path}`)

  if ( optionals?.noFragments === "true" ) {
    return (chat)
  }

  //Returning a combination of all the fragments, which make up a final html file to
  //be served to the browser
  return (header + /*chatLogin +*/ page + footer)
          .replace("%%TITLE_PLACEHOLDER%%", optionals?.title || "CDiary")
          .replace("%%SCRIPT_PLACEHOLDER%%", optionals?.script || "")
}

//Exporting the function so it can be imported in other files
module.exports = {
  assemblePage
}