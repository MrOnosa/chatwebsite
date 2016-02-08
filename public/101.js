(function () {
    var socket = io('/101');

    socket.emit('a message from the client to the server', "The client says, 'Hello!'");

    socket.on('a message from the server to the client', function (messageFromServer) {
        document.body.innerHTML += "<div>" + messageFromServer + "</div>";
    });
})();
