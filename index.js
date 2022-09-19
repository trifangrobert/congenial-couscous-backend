const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const gameLogic = require('./game-logic')
const app = express()

const server = http.createServer(app)
const io = socketio(server)

app.get("/", (req, res) => {
    res.send("<div>The server is open<div>");
})

io.on('connection', client => {
    console.log("hello from server, mister client");
    gameLogic.initializeGame(io, client)
})

server.listen(process.env.PORT || 8000)