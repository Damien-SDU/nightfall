var http = require('http');
var port = process.env.PORT || 3000
var express = require('express');
var app = express();

// Création du serveur et appel du dossier "public"
var server =  http.createServer(app);
app.use(express.static('public'));

// Chargement de socket.io
var io = require('socket.io')(server);

io.on('connection', function (socket) {

	// envoi d'un message à l'utilisateur
	// socket.emit('message', 'Vous êtes connecté');

	// envoi d'un message à tous les utilisateurs
    socket.broadcast.emit('message', 'Un nouvel utilisateur s\'est connecté');

    // réception d'un message d'un client
    socket.on('message', function (message) {
        console.log('Mesage d\'un client : ' + message);
    }); 

});

server.listen(port,() => {
  console.log(`Server running at port `+port);
});