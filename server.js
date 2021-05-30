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

const findPlayers = function(db, callback) {
    // Get the players collection
    const collection = db.collection('players');
    // Find all players
    collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    callback(docs);
    });
}

const updateDocument = function(db, callback) {
    // Get the players collection
    const collection = db.collection('players');
    // Update document where a is 2, set b equal to 1
    collection.updateOne({ a : 2 }//query
    , { $set: { b : 1 } }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    //console.log("Updated the document with the field a equal to 2");
    callback(result);
    });
}

const insertPlayers = function(db, callback) {
    // Get the players collection
    const collection = db.collection('players');
    // Insert some players
    collection.insertMany([
        {"name":"damien","location":"planet_a","data":{"moves":923,"hp":231,"xp":109,"gas":109,"wood":103,"iron":94,"water":158,"food":145,"weapon":54}}, 
        {"name":"andrea","location":"planet_a","data":{"moves":11,"hp":89,"xp":0,"gas":2,"wood":3,"iron":3,"water":1,"food":1,"weapon":0}},
        {"name":"pierre","location":"planet_a","data":{"moves":14,"hp":86,"xp":0,"gas":1,"wood":1,"iron":3,"water":5,"food":4,"weapon":2}}
    ], function(err, result) {
        assert.equal(err, null);
        assert.equal(3, result.result.n);
        assert.equal(3, result.ops.length);
        //console.log("Inserted 3 players into the collection");
        callback(result);
    });
    }


const removeDocument = function(db, callback) {
    // Get the players collection
    const collection = db.collection('players');
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
const dbName = 'damien_nightfall';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server db");
});



const findOneDocument = function(db, callback, login){
    var query = {name:login};
    console.log(query);
    db.collection("players").findOne(query, function(err, result) {
        if (result==null){
            var new_player = { "name" : login, "location" : "planet_a", "data" : { "moves" : 0, "hp" : 100, "xp" : 0, "gas" : 0, "wood" : 0, "iron" : 0, "water" : 0, "food" : 0, "weapon" : 0 } };
            db.collection("players").insertOne(new_player, null, function (error, results) {
                if (error) throw error;
                console.log("1 document inserted");
            });
            db.collection("players").findOne(query, function(err, result) {
                    callback(result);                
                });
        }//result= { "name" : "damien", "location" : "planet_a", "data" : { "moves" : 2, "hp" : 528, "xp" : 50, "gas" : 2, "wood" : 1, "iron" : 0, "water" : 2, "food" : 2, "weapon" : 1 } };
        else {
            callback(result);
        }
    });
}

const updateStatsPlayer = function(db, callback, query, formData){
    console.log(query);
    var collection = db.collection('players');
    collection.findOne(query, function(err, result) {
        //console.log(result.data.moves);
        //console.log(result.data.hp);
        //emit
        callback(result);


        collection.replaceOne(query, formData).then((ans) => {
            console.log("Successful");
        }).then((err) => {
            console.log(err);
        })    
        //delete
        /*db.collection("players").replaceOne(query, function(err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
        });

        //insert
        //(node:7784) DeprecationWarning: collection.insert is deprecated.
        //Use insertOne, insertMany or bulkWrite instead.
        db.collection("players").insertOne(formData, null, function (error, results) {
            if (error) throw error;
            console.log("1 document inserted");    
        });*/
    });
}

const scores_db = function(socket, db, message){
    var collection = db.collection('players');
    db.collection("players").find().sort({ 'data.xp': -1 }).toArray(function(err, result) {
        if (err) throw err;
        socket.emit('scores_db', result);
    });

    // just in case
    /*var example = {"name":"vincent","location":"planet_a","data":{"moves":928,"hp":226,"xp":19,"gas":111,"wood":105,"iron":94,"water":159,"food":146,"weapon":55}}
    db.collection("players").insert(example, null, function (error, results) {
        if (error) throw error;
        console.log("example inserted");    
    });*/
}

const zombies = function (db, loca, callback) {
    console.log("zombies fct"+loca);
    var query = {location:loca};
    //var data_zombies = {location: "planet_a", nb_zombies: 0};
    var collection = db.collection('zombies');
    collection.findOne(query, function(err, result) {
        callback(result, db);
    });
        /*db.collection("zombies").insertOne(data_zombies, null, function (error, results) {
            if (error) throw error;
            console.log("1 document zombies inserted");    
        });*/

        /*db.collection("zombies").updateOne(query, { $set: {name: "Mickey", address: "Canyon 123" } }, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
        });*/

}

const read_zombies = function (db, callback, loca, flag, command){
    var collection = db.collection('zombies');
    var query = {location:loca};
    collection.findOne(query, function(err, result) {
        callback(result.nb_zombies, flag, command);
    });
}










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

        MongoClient.connect(url, function(err, client) {
            var db = client.db(dbName);
            zombies(db, location, zombie_appear_fct);
        });   
        function zombie_appear_fct(result, db){
            var collection = db.collection('zombies');
            collection.findOne({location:result.location}, function(err, result) {

                var query = {location:result.location};
                var formData = {location: result.location, nb_zombies: result.nb_zombies+1};

                collection.replaceOne(query, formData).then((ans) => {
                    console.log("Successful");
                }).then((err) => {
                    console.log(err);
                })


                /*db.collection("zombies").deleteOne({location:result.location}, function(err, obj) {
                    if (err) throw err;
                    console.log("1 document zombie deleted");
                });

                db.collection("zombies").insertOne({location: result.location, nb_zombies: result.nb_zombies+1}, null, function (error, results) {
                    if (error) throw error;
                    console.log("1 document zombie inserted");    
                });*/
            });
            console.log(result);
        }

    });


    socket.on('zombie_kill', function (location) {
        MongoClient.connect(url, function(err, client) {
            var db = client.db(dbName);
            zombies(db, location, zombie_kill_fct);
        });   
        function zombie_kill_fct(result, db){
            var collection = db.collection('zombies');
            collection.findOne({location:result.location}, function(err, result) {

                var query = {location:result.location};
                var formData = {location: result.location, nb_zombies: result.nb_zombies-1};

                collection.replaceOne(query, formData).then((ans) => {
                    console.log("Successful");
                }).then((err) => {
                    console.log(err);
                })

            });
            console.log(result);

            socket.emit('zombie_kill', result.nb_zombies-1);
        }
    });


    socket.on('zombie_reset', function (location) {
        MongoClient.connect(url, function(err, client) {
            var db = client.db(dbName);
            zombies(db, location, zombies_reset);
        });   
        function zombies_reset(result, db){
            var collection = db.collection('zombies');
            collection.findOne({location:result.location}, function(err, result) {

                var query = {location:result.location};
                var formData = {location: result.location, nb_zombies: 0};

                collection.replaceOne(query, formData).then((ans) => {
                    console.log("Successful");
                }).then((err) => {
                    console.log(err);
                })


            });
            console.log(result);
        }
    });


    socket.on('scores_db', function (message) {
        MongoClient.connect(url, function(err, client) {
            var db = client.db(dbName);
            scores_db(socket, db, message);
            //updateStatsPlayer(db, test, query, req.body);
        });       
    });


    socket.on('get_player', function (name) {
        MongoClient.connect(url, function(err, client) {
            var db = client.db("damien_nightfall");
            findOneDocument(db, get_user_data, name);
        });
        function get_user_data(data){
            socket.emit('get_player', data);
            console.log(data);
        }

    });


    socket.on('write_player', function (player) {
        MongoClient.connect(url, function(err, client) {
            var db = client.db("damien_nightfall");
            var query = {name:player.name};

            updateStatsPlayer(db, print_stats_player, query, player);

        });
        function print_stats_player(data){
            console.log(data);
        }
    });





    socket.on('nb_zombies', function (loca, flag, command) {
        MongoClient.connect(url, function(err, client) {
            var db = client.db("damien_nightfall");
            read_zombies(db, print_nb_zombies, loca, flag, command);
        });
        function print_nb_zombies(number, flag, command){
            console.log(number);
            socket.emit('nb_zombies', number, flag, command);
        }
    });
});

http.listen(port,() => {
  console.log(`Server running at port `+port);
});

function user_connection(socket, login){
    MongoClient.connect(url, function(err, client) {
        var db = client.db(dbName);
        findOneDocument(db, send_user_data, login);

    });
    function send_user_data(data){
        socket.emit('user_data', data);
        console.log(data);
    }
    socket.emit('message', 'You are logged in');
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