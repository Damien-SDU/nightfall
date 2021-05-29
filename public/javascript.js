var player = {
    name: "",
    location: "",
    data: ""
};

var planet_coefficients = {
    "planet_a":{"gas":15,"wood":30,"iron":45,"water":60,"food":75, "weapon":82},
    "planet_b":{"gas":5,"wood":20,"iron":55,"water":70,"food":75, "weapon":82},
    "planet_c":{"gas":20,"wood":25,"iron":30,"water":50,"food":70, "weapon":77},
}


document.addEventListener("DOMContentLoaded", function() {
    init();
}, false);

function init() {

	socket = io.connect();


	// réception d'un message du serveur
    socket.on('message', function(message) {
    	alert('Message du serveur : ' + message);
        log_success();
    })

    socket.on('user_data', function(message) {
        console.log(message);
    })

    var user_input = document.querySelector("#user_input");
    user_input.addEventListener("click", submitCommand);


    socket.on('chat_message', function(msg, playerName){
        console.log(msg);
        var saveMessages = document.getElementById('messages').innerHTML;
        var messages = playerName + ": " + msg;
        document.getElementById('messages').innerHTML = messages +"<br>"+ saveMessages;
    });


    socket.on('scores_db', function(docs){
        console.log(docs);
        document.getElementById('text_scores_db').innerHTML = "<div>Scores:</div>";
        for (i = 0; i < docs.length; i++) {
            var person = docs[i];
            sc = document.getElementById('text_scores_db').innerHTML;
            sc = sc +"<div>" + person.name + ": " + person.data.xp + " XP</div>";
            document.getElementById('text_scores_db').innerHTML = sc;
        }
    });



    socket.on('zombie_kill', function (number_zombies) {
        if (number_zombies == 0){
            document.getElementById('zombie').innerHTML = "";
            document.getElementById('ascii').style.color = '#000000';
        }
        else{
            document.getElementById('zombie').innerHTML = number_zombies+ " zombies!";
        }

    });


    socket.on('get_player', function(data){
        console.log(data);
        player.location = data.location;
        player.data = data.data;
        updateHTML();
    });





socket.on('nb_zombies', function(number_zombies, flag, command){
    if (number_zombies == 0) {
    switch(command[0]) {
        case "search":
            search();
            break;
        case "teleport":
            if (player.data.gas>=3){
                teleport(command);
            }
            else{
                alert('You don\'t have enough gas');
            }
            break;
        case "eat":
            if (player.data.food>0){
                    eat();
                }
                else{
                    alert('You don\'t have enough food');
                }
            break;
        case "drink":
            if (player.data.water>0){
                    drink();
                }
                else{
                    alert('You don\'t have enough water');
                }
            break;
        case "weapon":
        case "build":
            if (player.data.wood>=3 && player.data.iron>=3){
                    weapon();
                }
                else{
                    alert('You don\'t have enough wood or iron');
                }
            break;
        default:
            invalidCommand(command);
            alert('Unvalid request');
                }
            }
            else {
                if (flag == 0){
                    // zombies attack
                    switch(command[0]) {
                        case "kill":
                            if (player.data.weapon>0){
                                    kill();
                                }
                                else{
                                    alert('You don\'t have enough weapon');
                                }
                            break;
                        case "wait":
                            wait();
                            break;
                        default:
                            invalidCommand(command);
                            alert('Unvalid request');
                        }
                }
            }
    });











}


function submitCommand() {
    var user_command = document.querySelector("#user_command");
    var command = user_command.value;

    parseCommand(command);

}

function parseCommand(command) {
    var command = command.toLowerCase();
    var command = command.split(" ");
    var flag = 0;
    if (player.data.hp>0){
        if (player.data.moves>50){
            if (Math.random()*100>95){//10% risk a zombie appear
                var loca=player.location;

                socket.emit('zombie_appear', loca);
                document.getElementById('zombie').innerHTML = "zombies!";
                document.getElementById('ascii').style.color = '#ff0000';
                flag = 1;
                alert("A zombie arrived!");
            }
        }

        var loca=player.location;
        console.log(loca);
        socket.emit('nb_zombies', loca, flag, command);
    }// still not dead, end
    else {
        if (player.data==""){// case player not logged in
            alert("Please log in first");
        }
        else{// case player died
            alert('Game Over');
        }
    }
    updateHTML();

}

function search() {
    var item = "";
    var saveHistory = document.getElementById('history').innerHTML;
    var history = "";
    var coef = Math.floor(Math.random() * 99) + 1;

    if (0 <= coef && coef <= planet_coefficients.planet_a.gas){
        console.log(coef);
        item = "gas";
    }
    else if (planet_coefficients.planet_a.gas < coef && coef <= planet_coefficients.planet_a.wood){
        console.log(coef);
        item = "wood";
    }
    else if (planet_coefficients.planet_a.wood <= coef && coef <= planet_coefficients.planet_a.iron){
        console.log(coef);
        item = "iron";
    }
    else if (planet_coefficients.planet_a.iron <= coef && coef <= planet_coefficients.planet_a.water){
        console.log(coef);
        item = "water";
    }
    else if (planet_coefficients.planet_a.water <= coef && coef <= planet_coefficients.planet_a.food){
        console.log(coef);
        item = "food";
    }
    else if (planet_coefficients.planet_a.food <= coef && coef <= planet_coefficients.planet_a.weapon){
        console.log(coef);
        item = "weapon";
    }
    else {
        console.log(coef);
        item = "nothing";
    }


    if (item != "nothing"){
        player.data[item]++;
        socket.emit('write_player', player);
        updateHTML();
    }
    history = history + "You found " + item;
    document.getElementById('history').innerHTML = history +"<br>"+ saveHistory;
    player.data.moves++;
    player.data.hp--;
}

function teleport(planet) {
    var planet = planet[1];
    
    console.log("origin planet", player.location);

    switch(planet) {
        case "planet_a":
            player.location = "planet_a";
            console.log(player.location);
            break;
        case "planet_b":
            player.location = "planet_b";
            console.log(player.location);
            break;
        case "planet_c":
            player.location = "planet_c";
            console.log(player.location);
            break;
        case "planet_d":
            player.location = "planet_d";
            console.log(player.location);
            break;
        default:
            invalidCommand(planet);
    }
    player.data.gas = player.data.gas-3;
    player.data.moves++;
    player.data.hp--;
}

function eat(){
    player.data.hp = player.data.hp+10;
    player.data.food--;
    player.data.moves++;
}

function drink(){
    player.data.hp = player.data.hp+10;
    player.data.water--;
    player.data.moves++;
}

function weapon(){
    player.data.weapon++;
    player.data.wood = player.data.wood-3;
    player.data.iron = player.data.iron-3;
    player.data.hp--;
}

function kill(){
    player.data.xp++;
    player.data.weapon--;
    var loca=player.location;

    socket.emit('zombie_kill', loca);
}

function wait(){
    player.data.hp = player.data.hp - 20;
    search();
}

function invalidCommand(cmd) {
    console.log('invalid command', cmd);
}

function log_success(){
    socket.emit('get_player', player.name);
    update_scores();
    //document.getElementById('help').innerHTML = "Possible moves :<br>search<br>eat (1 Food, +10HP)<br>drink (1 water, +10HP)<br>teleport planet_? (3 gas)<br>build or weapon (3 iron and 3 wood, +1 weapon)<br>kill (1 weapon, +1XP)<br>wait (-20HP)";
    document.getElementById('help').innerHTML = "<table><tr><th>Commands</th><th>Requirements</th><th>Benefits</th></tr><tr><td>search</td><td>none</td><td>???</td></tr><tr><td>eat</td><td>1 Food</td><td>10HP</td></tr><tr><td>drink</td><td>1 Water</td><td>10HP</td></tr><tr><td>teleport planet_?</td><td>3 gas</td><td>teleport</td></tr><tr><td>build/weapon</td><td>3 Iron + 3 Wood</td><td>1 Weapon</td></tr><tr><td>kill</td><td>1 Weapon</td><td>1XP</td></tr><tr><td>wait</td><td>none</td><td>-20HP</td></tr></table>";
}

function functionClickLogin() {
    var user_login = document.getElementById("login_text").value;
    console.log(user_login);
    if (user_login=="") {
        alert("unvalid login");
    }
    else {
        player.name = user_login.toLowerCase().split(' ').join('-').replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, "-").replace(/[^a-zA-Z ]/g, "");
        socket.emit('user_connection', user_login);
    }
}


function functionClickLogout() {
    player.data = ""
    player.name = ""
    player.location = ""
    alert("You have been logged out");
    document.getElementById('history').innerHTML = "";
    document.getElementById('help').innerHTML = "";

    document.getElementById('ressources').innerHTML = "";
    document.getElementById('gas').innerHTML = "";
    document.getElementById('wood').innerHTML = "";
    document.getElementById('iron').innerHTML = "";
    document.getElementById('water').innerHTML = "";
    document.getElementById('food').innerHTML = "";
    document.getElementById('weapon').innerHTML = "";
    document.getElementById('room').innerHTML = "";
    document.getElementById('moves').innerHTML = "";
    document.getElementById('hp').innerHTML = "";
    document.getElementById('xp').innerHTML = "";

    update_scores();
    }

function functionClick() {
    socket.emit('write_player', player);
    updateHTML();
}

function functionClickReset() {
    player.data = {"moves":0,"hp":100,"xp":0,"gas":0,"wood":0,"iron":0,"water":0,"food":0, "weapon":0};
    player.location = "planet_a";


    socket.emit('zombie_reset', player.location);


    document.getElementById('zombie').innerHTML = "";
    document.getElementById('ascii').style.color = '#000000';
    socket.emit('write_player', player);
    updateHTML();
    }

function update_scores(){
    socket.emit('scores_db', 'update_db');
}

function updateHTML(){
    document.getElementById('ressources').innerHTML = "Ressources of the player";
    document.getElementById('room').innerHTML = "You are on " + player.location;

    document.getElementById('moves').innerHTML = "Moves: "+ player.data.moves;
    document.getElementById('hp').innerHTML = "HP: "+ player.data.hp;
    document.getElementById('xp').innerHTML = "XP: "+ player.data.xp;
    document.getElementById('gas').innerHTML = "Gas: "+ player.data.gas;
    document.getElementById('wood').innerHTML = "Wood: "+ player.data.wood;
    document.getElementById('iron').innerHTML = "Iron: "+ player.data.iron;
    document.getElementById('water').innerHTML = "Water: "+ player.data.water;
    document.getElementById('food').innerHTML = "Food: "+ player.data.food;
    document.getElementById('weapon').innerHTML = "Weapon: "+ player.data.weapon;
}



function send() {
    var text = document.getElementById('chat').value;
    socket.emit('chat_message', text, player.name);
}


/*


************ AIDE MÉMOIRE JS ***********

****** AFFICHER UN RÉSULTAT DANS LA CONSOLE ******

console.log();




****** SÉLECTION D'ÉLÉMENT ******

var el = document.getElementById("mon_id");
var el = document.getElementsByClassName("ma_classe")[];
var el = document.getElementsByTagName("ma_balise")[];
var el = document.querySelector("mon_sélecteur");
var el = document.querySelectorAll("mon_sélecteur")[];




****** DÉCLARATION DE FONCTION ******

function maFonction() {
	console.log("hello");
}




****** BOUCLE FOR ******

for (i = 0; i < 10; i++) {
	console.log(i);
}




****** CONDITION ******

var condition = true;
if (condition) {
	console.log("vrai");
}

if (condition1) {
	console.log("condition1 : vrai");
} else if (condition2) {
	console.log("condition2 : vrai");
} else {
	console.log("condition1 et condition2 : faux");
}




****** ÉVÉNEMENT ******

element.addEventListener(mon_event, ma_fonction);
element.removeEventListener(mon_event, ma_fonction)

"click" "mousedown" "mousemove" "mouseover" "mouseenter" "mouseleave"
"keypress" "keydown" "keyup"




****** TOUCHES CLAVIER ******

À venir…




****** CRÉATION D'ÉLÉMENT ******

var el = document.createElement('div');
var el = document.createTextNode();

container.appendChild(el);




****** INSERTION D'ÉLÉMENT ******

container.appendChild(el);
container.removeChild(el);




****** ÉLÉMENT : ID ET ATTRIBUT ******

el.id = "mon_id";

el.setAttribute("nom_attribut", "valeur_attribut");
el.getAttribute("nom_attribut");  




****** ÉLÉMENT : LISTE DE CLASS ******

element.classList.toggle();
el.classList.remove();
el.classList.add();
el.classList.contains();




****** NOMBRE D'ÉLÉMENTS / LONGUEUR D'UN ÉLÉMENT ******

var nb = el.length;




****** STYLE ******

el.style.propriété_css = "valeur";




****** TAILLE DE LA FENETRE ******

var screen_width = window.innerWidth;
var screen_height = window.innerHeight;




****** VIDÉO ******

video.load();
video.pause();
video.play();
video.setAttribute("onended", "maFonction()");
video.setAttribute("controls", "true");




****** GESTION DE TABLEAU ******

var tableau = [];
tableau.push();




****** GESTION DE CHAÎNE DE CARACTÈRES ******

el.toLowerCase().split(' ').join('-').replace();




****** ATTENTE ET RÉPÉTITION ******

setTimeout(function(){
	console.log("hello");
}, 3000);

setInterval(maFonction, 1000);




****** OPÉRATEURS ******

== égal à

!= différent de

=== contenu et type égal à

!== contenu ou type différent de

> supérieur à

>= supérieur ou égal à

< inférieur à

<= inférieur ou égal à




****** CONDITIONS ******

&& ET

|| OU

! NON



*/




