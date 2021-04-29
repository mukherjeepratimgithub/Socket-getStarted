const express = require('express');
const app = express();
const http = require('http');
//const { isObject } = require('util');
const path = require('path');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;

// app.get('/',(req,res) =>{
//     res.sendFile(__dirname + '/index.html');
// });

server.listen(port, () => {
    console.log('Server listening at port %d', port);
  });
  
  // Routing
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Chatroom
  
  let numUsers = 0;
  
  io.on('connection', (socket) => {
    let addedUser = false;
  
    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
      // we tell the client to execute 'new message'
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data
      });
    });
  
    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {
      if (addedUser) return;
  
      // we store the username in the socket session for this client
      socket.username = username;
      ++numUsers;
      addedUser = true;
      socket.emit('login', {
        numUsers: numUsers
      });
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
      });
    });
  
    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
      socket.broadcast.emit('typing', {
        username: socket.username
      });
    });
  
    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', {
        username: socket.username
      });
    });
  
    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
      if (addedUser) {
        --numUsers;
  
        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        });
      }
    });
  });

// io.emit('some event', { 
//     someProperty: 'some value', 
//     otherProperty: 'other value' 
    
// });
//  // This will emit the event to all connected socket

// //socket.broadcast.emit('hi');

// io.on('connection', (socket) => {

//     socket.broadcast.emit('new message',{
//         username:socket.username,
//         message:data
//     });

//     socket.on('chat message',(msg) => {
//         console.log('message: ' + msg);
//     });
//     console.log('a user connected');
//      socket.on('disconnect', () =>{
//          console.log('user disconnected');
//     });
// });

// server.listen(3000,() =>{
//     console.log('Listening on port :3000');
// })
