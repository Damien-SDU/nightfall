var express = require("express");
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000
var fs = require('fs');

// mise en place du routeur
var router = express.Router();
// pour parser un POST JSON
var bodyParser = require('body-parser');
app.use(bodyParser.json());
// servir le dossier "public"
app.use(express.static('public'));

// récup d'une requête POST
app.post("/", function(req,res){
    console.log(req.body);

    // écriture du fichier data.json
    var content = JSON.stringify(req.body);
    fs.writeFile("public/data/data.json", content, function (err) {
        if (err) return console.log(err);
    });
    
    return res.send(req.body);
});

// SOCKET IO
var io = require('socket.io')(http);
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

http.listen(port,() => {
  console.log(`Server running at port `+port);
});


/*

var http = require('http');
var express = require("express");
var app = express();


var router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static('public'));


var customers = [];

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

app.post("/", function(req,res){
    console.log(req.body);
    return res.send(req.body);
});

app.use("/",router);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
*/



/*
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

var port = process.env.PORT || 3000
var app = express();

// Création du serveur
var server =  http.createServer(app);
var router = express.Router();
// appel du dossier "public"
app.use(express.static('public'));
// use router
app.use("/",router);
// pour parser un POST json
app.use(bodyParser.json());


router.use(function (req,res,next) {
    console.log("/" + req.method);
    next();
});

// AJAX POST
app.post("/", function(req, res) {
    console.log(req.body);
    return res.send("lo");
});


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
*/