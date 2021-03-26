

var player = {
    inventory:[],
    location: ""
};

player.location = "planet_a";
var room = player.location;


document.addEventListener("DOMContentLoaded", function() {
    init();
}, false);

function init() {

	socket = io.connect();

	// réception d'un message du serveur
    socket.on('message', function(message) {
    	alert('Message du serveur : ' + message);
    })

    /*var poke = document.querySelector("#poke");
    poke.addEventListener("click", clickSurPoke);

    function clickSurPoke() {
    	// envoi d'un message au serveur
        socket.emit('message', 'There was a click');
    }*/


    var user_input = document.querySelector("#user_input");
    user_input.addEventListener("click", submitCommand);

}


function submitCommand() {
    var user_command = document.querySelector("#user_command");
    var command = user_command.value;

    parseCommand(command);
}

function parseCommand(command) {
    var command = command.toLowerCase();
    var command = command.split(" ");

    // "go north"

    switch(command[0]) {
        case "go":
            go(command);
            break;
        case "teleport":
            teleport(command);
            break;
        default:
            invalidCommand(command);
    }

}

function go(direction) {
    var direction = direction[1];
    var item = "";
    var saveHistory = document.getElementById('history').innerHTML;
    var history = "";

    switch(direction) {
        case "north":
            console.log("north");
            history = history + "You went North.";
            break;
        case "south":
            console.log("south");
            history = history + "You went South.";
            break;
        case "east":
            console.log("east");
            history = history + "You went East.";
            break;
        case "west":
            console.log("west");
            history = history + "You went West.";
            break;
        default:
            invalidCommand(direction);

    }
    switch(Math.floor(Math.random() * 9) + 1) {
        case 1:
            item = "gas";
            text = localStorage.getItem("testJSON");
            scores = JSON.parse(text);
            scores.gas = scores.gas+1;
            myJSON = JSON.stringify(scores);
            localStorage.setItem("testJSON", myJSON);
            document.getElementById('gas').innerHTML = "Gas: "+ scores.gas;
            break;
        case 2:
            item = "wood";
            text = localStorage.getItem("testJSON");
            scores = JSON.parse(text);
            scores.wood = scores.wood+1;
            myJSON = JSON.stringify(scores);
            localStorage.setItem("testJSON", myJSON);
            document.getElementById('wood').innerHTML = "Wood: "+ scores.wood;
            break;
        case 3:
            item = "iron";
            text = localStorage.getItem("testJSON");
            scores = JSON.parse(text);
            scores.iron = scores.iron+1;
            myJSON = JSON.stringify(scores);
            localStorage.setItem("testJSON", myJSON);
            document.getElementById('iron').innerHTML = "Iron: "+ scores.iron;
            break;
        case 4:
            item = "water";
            text = localStorage.getItem("testJSON");
            scores = JSON.parse(text);
            scores.water = scores.water+1;
            myJSON = JSON.stringify(scores);
            localStorage.setItem("testJSON", myJSON);
            document.getElementById('water').innerHTML = "Water: "+ scores.water;
            break;
        case 5:
            item = "food";
            text = localStorage.getItem("testJSON");
            scores = JSON.parse(text);
            scores.food = scores.food+1;
            myJSON = JSON.stringify(scores);
            localStorage.setItem("testJSON", myJSON);
            document.getElementById('food').innerHTML = "Food: "+ scores.food;
            break;
        default:
            item = "nothing";
    }
    history = history + " You found " + item;
    document.getElementById('history').innerHTML = history +"<br>"+ saveHistory;
}

function teleport(planet) {
    var planet = planet[1];
    
    console.log("planète d'origine", player.location);

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
}

function invalidCommand(cmd) {
    console.log('Comande invalide', cmd);
}



function functionClick() {
    text = localStorage.getItem("testJSON");
    scores = JSON.parse(text);

    console.log(scores); 
    console.log(scores.hp); 
    let moves = scores.moves+1;
    let hp = scores.hp-1
    document.getElementById('moves').innerHTML = "Moves: "+ moves;
    document.getElementById('hp').innerHTML = "HP: "+ hp;
    scores.moves = scores.moves+1;
    scores.hp = scores.hp-1;
    myJSON = JSON.stringify(scores);
    localStorage.setItem("testJSON", myJSON);

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




