//Importing express and assigning it to a variable
const express = require("express")

//Instatiate an express app
const app = express()

//Setting the imports I'll need for my server
const http = require("http")
const socketio = require('socket.io')
const formatMessage = require("./services/formatDate.js")

//Initializing a socketio server with http
const server = http.createServer(app)
const io = socketio(server)

const {
  getActiveUser,
  exitRoom,
  newUser,
  getIndividualRoomUsers
} = require("./services/users.js")


io.on("connection", socket => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = newUser(socket.id, username, room)

    socket.join(user.room)

    socket.emit("message", formatMessage("WebCage", "Messages are limited to this room!"))

    socket.broadcast
      .to(user.room)
      .emit(
          "message",
          formatMessage("WebCage", `${user.username} has joined the room!`)
      )

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getIndividualRoomUsers(user.room)
    })
  })

  socket.on("chatMessage", msg => {
    const user = getActiveUser(socket.id)

    io.to(user.room).emit("message", formatMessage(user.username, msg))
  })

  socket.on("disconnect", () => {
    const user = exitRoom(socket.id)

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("WebCage", `${user.username} has left the room`)
      )

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getIndividualRoomUsers(user.room)
      })
    }
  })
})


//Setting a public folder
app.use(express.static("public/"))

//Importing the routers
const entryRouter = require("./routers/entries.js")

//Instruct Express to use the routers
app.use(entryRouter.router)

//Import my assemblePage function
const { assemblePage } = require("./services/htmlRender.js")

//Assign my pages to variables (Not nescessary but I think it's easier like this)
const index = assemblePage("index/index.html", {
  title: "CDiary | Entries",
  script: '<script src="/views/index/index.js"></script>\n<script src="/views/entries/createEntry.js"></script>'
})

const chat = assemblePage("fragments/chat/chat.html", {
  noFragments: "true",
})

//API methods I only keep the GET methods here, all other API goes via routers. 
//If I had many more urls to manage, I'd move these to their respective routers
app.get("/", (req, res) => {
  res.send(index)
})

app.get("/chat", (req, res) => {
  res.send(chat)
})

//Define which port the app will run on
const PORT = process.env.PORT || 8080

//Calling the listen method which makes express run the app on the given port,
//I also included an error logger which notifies via the console if an error occurs
app.listen(PORT, (error) => {
  if (error) {
    console.log("Server encountered an error\nError: ", error)
  } else {
    console.log("Server is up and running on port: ", PORT)
  }
})