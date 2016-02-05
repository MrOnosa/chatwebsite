var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/chat.html');
})

app.get('/101', function(request, response) {
  response.sendFile(__dirname + '/public/101.html');
})

//Create "101" namespace
var io_101 = io.of('/101');
io_101.on('connection', function(socket){
  console.log("holy guacamole this worked i'm so smart eeeeeee ");
});

//Create "chat" namespace
var io_chat = io.of('/chat');
// usernames which are currently connected to the "chat"
var usernames = {};
var numUsers = 0;
io_chat.on('connection', function(socket){
  console.log('a user connected');
  var addedUser = false;

   socket.on('add user', function (uniqueIdentifer, username) {
    // we store the username in the socket session for this client
    socket.uniqueIdentifer = uniqueIdentifer;
    socket.username = username;
    // add the client's username to the global list
    usernames[uniqueIdentifer] = username;
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

  socket.on('disconnect', function(){
    console.log('user disconnected: ' + socket.username);

	// remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.uniqueIdentifer];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
  }});

   socket.on('chat message', function(username, msg){
    if(username != socket.username)
    {
      //The user has decided to change their name.
      usernames[socket.uniqueIdentifer] = username;

      io_chat.emit('user renamed', {
        oldUsername: socket.username,
        username: username
      });

      socket.username = username;
    }

    console.log(socket.username + ': ' + msg);
  	io_chat.emit('chat message', {
        username: socket.username,
        uniqueIdentifer: socket.uniqueIdentifer,
        message: msg
      });

	//Sends to everyone else...
	//socket.broadcast.emit('chat message', {
    //  username: socket.username,
    //  message: msg
    //});
  });
});

http.listen(app.get('port'), function(){
  console.log("Node server is listening on port:" + app.get('port'))
});
