var express = require("express");
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000
var fs = require('fs');

var router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static('public'));



// FROM: https://github.com/mongodb/node-mongodb-native

const findDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Find all documents
    collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    //console.log("Found the following records");
    //console.log(docs)
    callback(docs);
    });
}

const updateDocument = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Update document where a is 2, set b equal to 1
    collection.updateOne({ a : 2 }//query
    , { $set: { b : 1 } }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    //console.log("Updated the document with the field a equal to 2");
    callback(result);
    });
}

const insertDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Insert some documents
    collection.insertMany([
        {"name":"damien","location":"planet_a","data":{"moves":923,"hp":231,"xp":109,"gas":109,"wood":103,"iron":94,"water":158,"food":145,"weapon":54}}, 
        {"name":"andrea","location":"planet_a","data":{"moves":11,"hp":89,"xp":0,"gas":2,"wood":3,"iron":3,"water":1,"food":1,"weapon":0}},
        {"name":"pierre","location":"planet_a","data":{"moves":14,"hp":86,"xp":0,"gas":1,"wood":1,"iron":3,"water":5,"food":4,"weapon":2}}
    ], function(err, result) {
        assert.equal(err, null);
        assert.equal(3, result.result.n);
        assert.equal(3, result.ops.length);
        //console.log("Inserted 3 documents into the collection");
        callback(result);
    });
    }


const removeDocument = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Delete document where a is 3
    collection.deleteOne({ a : 3 }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    //console.log("Removed the document with the field a equal to 3");
    callback(result);
    });
}

// *** *** *** *** *** *** *** *** *** ***
// *** STARTS HERE *** *** *** *** *** ***
// *** *** *** *** *** *** *** *** *** ***


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server db");
});



const findOneDocument = function(db, callback, query){
    console.log(query);
    var collection = db.collection('documents');
    collection.findOne(query, function(err, result) {
        //console.log(result.data.moves);
        //console.log(result.data.hp);
        //emit
        callback(result);
    });
}

const updateStatsPlayer = function(db, callback, query, formData){
    console.log(query);
    var collection = db.collection('documents');
    collection.findOne(query, function(err, result) {
        //console.log(result.data.moves);
        //console.log(result.data.hp);
        //emit
        callback(result);

        //delete
        db.collection("documents").deleteOne(query, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
        });

        //insert
        //(node:7784) DeprecationWarning: collection.insert is deprecated.
        //Use insertOne, insertMany or bulkWrite instead.
        db.collection("documents").insertOne(formData, null, function (error, results) {
            if (error) throw error;
            console.log("1 document inserted");    
        });
    });
}

const scores_db = function(socket, db, message){
    var collection = db.collection('documents');
    db.collection("documents").find().sort({ 'data.xp': -1 }).toArray(function(err, result) {
        if (err) throw err;
        socket.emit('scores_db', result);
    });

    // just in case
    /*var example = {"name":"vincent","location":"planet_a","data":{"moves":928,"hp":226,"xp":19,"gas":111,"wood":105,"iron":94,"water":159,"food":146,"weapon":55}}
    db.collection("documents").insert(example, null, function (error, results) {
        if (error) throw error;
        console.log("pierre a bien été inséré");    
    });*/
}
















app.post("/", function(req,res){
    console.log(req.body);

    console.log("ici");
    console.log(req.body.name);
    var formData = JSON.stringify(req.body);

    console.log("app post operer ici");

    MongoClient.connect(url, function(err, client) {
        var db = client.db(dbName);
        var query = {name:req.body.name};

        updateStatsPlayer(db, test, query, req.body);

    });
    function test(data){
        /* if data == null{
            createDocument(login);
        }
        else{
            socket.emit('user_data', data);
        }*/
        //socket.emit('user_data', data);
        console.log(data);
    }










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



    socket.on('chat_message', function (msg, playerName) {
        console.log("message reçu:"+msg);
        console.log(playerName);
        socket.broadcast.emit('chat_message', msg, playerName);
        socket.emit('chat_message', msg, playerName);
        //io.emit('chat_message', 'You are logged in');
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


        //ici db !


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


        // ici db !


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



        //ici db !


    });


    socket.on('scores_db', function (message) {
        MongoClient.connect(url, function(err, client) {
            var db = client.db(dbName);
            scores_db(socket, db, message);
            //updateStatsPlayer(db, test, query, req.body);
        });       
    });
});

http.listen(port,() => {
  console.log(`Server running at port `+port);
});

function user_connection(socket, login){
    var sanitize_login = login.toLowerCase().split(' ').join('-').replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, "-").replace(/[^a-zA-Z ]/g, "");
    //console.log(db);
    MongoClient.connect(url, function(err, client) {
        var db = client.db(dbName);
        var query = {name:login};

        findOneDocument(db, test, query);

    });
    function test(data){
        /* if data == null{
            createDocument(login);
        }
        else{
            socket.emit('user_data', data);
        }*/
        socket.emit('user_data', data);
        console.log(data);
    }

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