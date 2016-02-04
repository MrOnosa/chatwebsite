$(function() {
	  var $window = $(window);

    //var username = Math.random().toString(36).substr(2, 5);
    //username = cleanInput(username);

  var uniqueIdentifer = Math.random();
  var username = 'Guest_'+uniqueIdentifer.toString(10).substr(2,4);
	$('#usernameInput').val(username);

	var socket = io();
	  $('form').submit(function(){
  		socket.emit('chat message', $('#usernameInput').val(), $('#chatInput').val());
  		$('#chatInput').val('');
  		return false;
	  });

	  socket.on('chat message', function(data){
      var chatMessageDomElement = $('<li>').text(data.username + ": " + data.message);

      if(data.uniqueIdentifer == uniqueIdentifer)
      {
        chatMessageDomElement = chatMessageDomElement.addClass("messageFromUser");
      }

		    $('#messages').append(chatMessageDomElement);
	  });

	  socket.on('login', function (data) {

    // Display the welcome message
    $('#messages').append($('<li>').text("Welcome to Socket.IO Chat. " + data.numUsers + " users online"));
  });

	  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
	  $('#messages').append($('<li>').addClass('messageFromServer').text(data.username + ' joined. ' + data.numUsers + ' users here.'));
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
	  $('#messages').append($('<li>').addClass('messageFromServer').text(data.username + ' left. ' + data.numUsers + ' users remain.'));
  });

  // Whenever the server emits 'user renamed', log it in the chat body
  socket.on('user renamed', function (data) {
	  $('#messages').append($('<li>').addClass('messageFromServer').text(data.oldUsername + ' has changed thier username to ' + data.username + '.'));
  });


	  function cleanInput (input) {
		    return $('<div/>').text(input).text();
	  }


	  // Tell the server your username
	  socket.emit('add user', uniqueIdentifer, username);
});
