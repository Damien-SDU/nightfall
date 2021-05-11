var express = require("express");
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000
var fs = require('fs');

var router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static('public'));

app.post("/", function(req,res){
    console.log(req.body);

    console.log("ici");
    console.log(req.body.name);
    var formData = JSON.stringify(req.body);
    fs.writeFile("public/data/players/"+req.body.name+".json", formData, function (err) {
        if (err) return console.log(err);
    });
    
    return res.send(req.body);
});



// SOCKET IO
var io = require('socket.io')(http);
io.on('connection', function (socket) {

    socket.broadcast.emit('message', 'A new player logged in');

    socket.on('message', function (message) {
        console.log('Mesage d\'un client : ' + message);
    });

    socket.on('user_connection', function (login) {
        user_connection(socket, login);

    });

    socket.on('zombie_appear', function (location) {
        console.log(location);
        console.log("+1 zombie");
        fs.readFile('public/data/nbzombies.json', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            var data = JSON.parse(data);
            data[location]++;

            var data = JSON.stringify(data);

            fs.writeFile("public/data/nbzombies.json", data, function (err) {
                if (err) return console.log(err);
            });
        });
    });


    socket.on('zombie_kill', function (location) {
        console.log(location);
        console.log("-1 zombie");
        fs.readFile('public/data/nbzombies.json', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            var data = JSON.parse(data);
            data[location]--;

            var data = JSON.stringify(data);

            fs.writeFile("public/data/nbzombies.json", data, function (err) {
                if (err) return console.log(err);
            });
        });
    });


    socket.on('zombie_reset', function (location) {
        console.log("0 zombie");
        fs.readFile('public/data/nbzombies.json', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            var data = JSON.parse(data);
            data = {"planet_a":0,"planet_b":0,"planet_c":0};

            var data = JSON.stringify(data);

            fs.writeFile("public/data/nbzombies.json", data, function (err) {
                if (err) return console.log(err);
            });
        });
    });


});

http.listen(port,() => {
  console.log(`Server running at port `+port);
});

function user_connection(socket, login){
    var sanitize_login = login.toLowerCase().split(' ').join('-').replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, "-").replace(/[^a-zA-Z ]/g, "");


    fs.readFile('public/data/players.json', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    var data = JSON.parse(data);

    var key_login = Object.keys(data).find(key => data[key] === login);
    if (key_login == undefined){
        data[sanitize_login] = login;
        var data = JSON.stringify(data);
        fs.writeFile("public/data/players.json", data, function (err) {
        if (err) return console.log(err);
        });
        var start_user = {};
        start_user.name = login;
        start_user.location = "planet_a";
        start_user.data = {"moves":0,"hp":100,"xp":0,"gas":0,"wood":0,"iron":0,"water":0,"food":0, "weapon":0};
        start_user = JSON.stringify(start_user);
        var url = "public/data/players/"+sanitize_login+".json";
        fs.writeFile(url, start_user, function (err) {
        if (err) return console.log(err);
        });
        socket.emit('message', 'You are logged in');
    }
    else{
        socket.emit('message', 'You are logged in');
    }
    

    });
}


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