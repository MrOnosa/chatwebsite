var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/index.html');
})

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function(socket){
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

      io.emit('user renamed', {
        oldUsername: socket.username,
        username: username
      });

      socket.username = username;
    }

    console.log(socket.username + ': ' + msg);
  	io.emit('chat message', {
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
