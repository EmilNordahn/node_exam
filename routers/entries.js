//Importing some of the modules I need, such as router for express and firebase certs
const bodyParser = require("body-parser")
const router = require("express").Router()
const admin = require("firebase-admin")
const serviceAccount = require("../secretKey.json")

//Initializing the firebaseapp this authorises the app to make changes to the database
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://communal-diary-default-rtdb.europe-west1.firebasedatabase.app",
})

//Declaring the database as a variable to be used in methods 
//as well as a string with the name of my collection
const database = admin.firestore()
const entryCollection = "entries"

//Instructing express to parse json and urlencoded bodies
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({
  extended: false,
}))

//This short function takes a Date object and returns a string that is more legible
function makeDateReadable(dateObject) {
  return dateObject.toDateString() + " at: " + dateObject.getHours() + ":" + dateObject.getMinutes()
}

//Declaring the get method, calling an async arrow function as I need to 
//get the entries from firebase
let latestDoc = null

router.get("/entries", async (req, res) => {

  const entries = []
  let limit = 5

  try {
    if ( latestDoc == null ) {
      latestDocQuery = await database
        .collection(entryCollection)
        .orderBy("timeStamp", "desc")
        .limit(1)
        .get()
      latestDoc = latestDocQuery.docs[0]
      latestDocData = latestDoc.data()
      latestDocData.timeStamp = makeDateReadable(latestDocData.timeStamp.toDate())
      entries.push(latestDocData)
      limit--
    }

    const data = await database.collection(entryCollection)
      .orderBy("timeStamp", "desc")
      .startAfter( latestDoc )
      .limit( limit )
      .get()

    
    data.docs.forEach(doc => {

      entries.push({
        id: doc.id,
        title: doc.data().title,
        content: doc.data().content,
        score: doc.data().score,
        timeStamp: makeDateReadable(doc._createTime.toDate())
      })
    })

    latestDoc = data.docs[data.docs.length - 1]

    const response = {
      entries: entries,
      latestDoc: latestDoc
    }


    res.send({response})
  } catch (error) {
    console.log("Couldn't get data from collection Error: ", error);
  }
})

//Importing multiparty which I use to store and parse my form
const multiparty = require("multiparty")

//Declaring a post method for entries, and uploads it to Firebase
router.post("/", async (req, res) => {
  
  //Declaring a multiparty form and an empty object
  let form = new multiparty.Form()
  let data = {}

  form.parse(req, async (err, fields) => {
    let entry = {}

    //I declare a try-catch here to make it easier to pinpoint any bugs
    try {

      //Iterating through the form and copying each field as a string to the data object
      Object.keys(fields).forEach( (property) => {
        data[property] = fields[property].toString()
      })

      //Creating the object I want to upload to Firestore, I want a score system
      //So it made sense to me to declare it as 0 from its creation

      entry = {
        title: data.title,
        content: data.content,
        score: 0,
        timeStamp: admin.firestore.FieldValue.serverTimestamp(),
      }

    } catch (error) {

      //This catches if something should go wrong with creating the entry
      //Ie. misnamed fields, etc
      console.log("Couldn't create object, error: \n", error)
    }
    //Another try-catch this time to catch any errors regarding Firestore

    try{
      
      //Here I call the add method on my Firestore collection and adding the entry object
      //to my 'entries' collection
      const newDoc = await database.collection(entryCollection).add(entry)  
      console.log("Posted with id: " + newDoc.id)
      
      //Responds with a 201 status confirming the creation of the object in the database
      res.status(201).send()

    } catch (error) {

      //Catches if something goes wrong and responds with a 400 status and logs the error message
      res.status(400).send("Couldn't save document in Firestore error: " + error)
    }
  })
})

//Exporting the router to be imported in my app.js
module.exports = {
  router
}