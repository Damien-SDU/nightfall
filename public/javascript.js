var player = {
    name: "",
    location: "",
    data: ""
};

var planet_coefficients = {
    "planet_a":{"gas":15,"wood":30,"iron":45,"water":60,"food":75, "weapon":76},
    "planet_b":{"gas":5,"wood":20,"iron":55,"water":70,"food":75, "weapon":76},
    "planet_c":{"gas":20,"wood":25,"iron":30,"water":50,"food":70, "weapon":71},
}

var number_zombies = {"planet_a":0, "planet_b":0, "planet_c":0}

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

    /* AJAX */
    
    // GET
    //ajaxGet();
    // POST
    //ajaxPost();

}

function ajaxGet() {
    //$.getJSON('/data/data.json', function(data) {
    $.getJSON('/data/players/'+player.name+'.json', function(data) {
        console.log(data);
        player.data = data.data;

    updateHTML();
    })
    .fail(function() {
        console.log("error");
    })
}

function ajaxPost(formData){
    //console.log(formData.data["moves"]);
    $.ajax({
        type : "POST",
        contentType : "application/json",
        url : "/",
        data : JSON.stringify(formData),
        dataType : 'json',
        success: function(data) {
            console.log(data);
        },
        error: function(e) {
            console.log("ERROR: ", e);
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

    // "go north"
    //socket.emit('message', 'You are logged in');


    // x%y proba zombies

    if (player.data.hp>0){
        //var loca=player.location;
        //console.log(loca);
        //if (number_zombies[loca] == 0) {
            switch(command[0]) {
                case "search":
                    search();
                    break;
                case "teleport":
                    if (player.data.gas>=20){
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
                    if (player.data.wood>9 && player.data.iron>9){
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
        /*}
        else { // zombies attack
            switch(command[0]) {
                case "kill":
                    kill();
                    break;
                case "hide":
                    hide();
                    break;
                }
        }*/





    }
    else {
        alert('Game Over');
    }
    updateHTML();

}

function search() {
    var item = "";
    var saveHistory = document.getElementById('history').innerHTML;
    var history = "";
    var coef = Math.floor(Math.random() * 99) + 1;
    //console.log(player.location);
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
        //text = localStorage.getItem("testJSON");//read file
        //scores = JSON.parse(text);
        //scores[item] ++;
        //myJSON = JSON.stringify(scores);
        //localStorage.setItem("testJSON", myJSON);//write file
        //document.getElementById(item).innerHTML = (item.charAt(0).toUpperCase() + item.substring(1).toLowerCase())+": "+ scores[item];//update score
        player.data[item]++;
        ajaxPost(player);
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
    player.data.gas = player.data.gas-20;
    player.data.moves++;
    player.data.hp--;
}

function eat(){
    player.data.hp = player.data.hp+10;
    player.data.food--;
    player.data.moves++;
}

function drink(){
    player.data.hp = player.data.hp+21;
    player.data.water--;
    player.data.moves++;
    player.data.hp--;
}

function weapon(){
    player.data.weapon++;
    player.data.wood = player.data.wood-10;
    player.data.iron = player.data.iron-10;
    player.data.hp--;
}

function invalidCommand(cmd) {
    console.log('Comande invalide', cmd);
}

function functionClickLogin() {
    var user_login = document.getElementById("login_text").value;
    console.log(user_login);
    socket.emit('user_connection', user_login);
    player.name = user_login.toLowerCase().split(' ').join('-').replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, "-").replace(/[^a-zA-Z ]/g, "");
    //console.log(player.location);
    ajaxGet();
}


function functionClickLogout() {
    //logout
    }

function functionClick() { // incomplet !!!!!!!!!!!!!
    //console.log(player.data);
    ajaxPost(player);
    updateHTML();
}

function functionClickReset() {
    player.data = {"moves":0,"hp":100,"xp":0,"gas":0,"wood":0,"iron":0,"water":0,"food":0, "weapon":0};
    player.location = "planet_a";
    ajaxPost(player);
    ajaxGet();
    updateHTML();
    }

function updateHTML(){ // à compléter !
    document.getElementById('text_scores').innerHTML = "<div>Scores of the players: <br>Player1: 10XP<br>Player 2: 22XP</div>";
    
    document.getElementById('ressources').innerHTML = "Ressources";
    document.getElementById('room').innerHTML = "Nightfall";
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




