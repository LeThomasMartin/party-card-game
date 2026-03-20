// Deck de cartes pour le jeu
const DECK = [
    // BOISSON
    { text: "Les gars boivent", category: "boisson" },
    { text: "Les filles boivent", category: "boisson" },
    { text: "Drinking race !", category: "boisson" },
    { text: "Prend un SHOT!", category: "boisson" },
    { text: "Donne deux gorgées", category: "boisson" },
    { text: "Ta gauche et ta droite boivent", category: "boisson" },
    { text: "Celui qui a le moins bu termine sa boisson", category: "boisson" },
    { text: "finis ta boisson !", category: "boisson" },
    { text: "Gorgée générale !", category: "boisson" },
    { text: "Prends une gorgée", category: "boisson" },
    { text: "Donne 2 shots", category: "boisson" },
    { text: "Ceux en couple boivent", category: "boisson" },

    // PARLER
    { text: "Quel est le truc le plus BDSM que tu as fait ?", category: "parler" },
    { text: "Raconte ta pire annectode de sexe", category: "parler" },
    { text: "Selon toi... qui est le moins bien habillé dans la pièce ?", category: "parler" },
    { text: "Si tu devais changer de vie avec une personne dans la piece ce serait qui ?", category: "parler" },
    { text: "Excepté ton partenaire avec qui sortirais-tu dans la pièce ?", category: "parler" },
    { text: "Quel est ton plus grand fantasme ?", category: "parler" },
    { text: "Avec qui voudrais-tu le moins être en couple dans la pièce ?", category: "parler" },
    { text: "Pose la question de ton choix à la personnne de ton choix", category: "parler" },
    { text: "Qui appellerais tu dans la pièce pour t'aider à cacher un corps ?", category: "parler" },
    { text: "Quelle est ta pire perte d'argent ?", category: "parler" },
    { text: "À quand remonte ton dernier orgasme ?", category: "parler" },
    { text: "Décris ton meilleur souvenir en 30 secondes", category: "parler" },
    
    // DÉFI
    { text: "Change un bout de vêtement avec la personne en face", category: "défi" },
    { text: "Avale un oeuf cru", category: "défi" },
    { text: "La personne de ton choix te fait un belly shot", category: "défi" },
    { text: "Drink un shot ! mystère", category: "défi" },
    { text: "Laisse les gens texter à une personne avec ton cell (pas le droit de suprimmer avant demain)", category: "défi" },
    { text: "Sort dehors deux bonnes minutes ", category: "défi" },
    { text: "Laisse les gens fouiller dans ton cell 2 bonnes minutes", category: "défi" },
    { text: "Kiss ton partenaire en ayant une gorgée (Transfert la)", category: "défi" },
    { text: "Fais un tour de la bâtisse. Pas le droit de mettre un manteau ou des bottes", category: "défi" },
    { text: "Enlève un bout de vêtement", category: "défi" },
    { text: "Fait 15 push-up (les filles ont le droit au genoux) 💪", category: "défi" },
    { text: "Appel le dernier numéro a qui tu as parlé. Pas le droit de racrocher avant 1 minutes (s'il répond pas passe au suivant)", category: "défi" },
    
    // DIVERS
    { text: "Votons ! La personne qui déçoit le plus ses parents boit", category: "divers" },
    { text: "Votons ! Le plus résistant à l'alcool finit sa boisson", category: "divers" },
    { text: "Ont prend un selfi tout le monde ensemble", category: "divers" },
    { text: "Jeu de la carte bisou", category: "divers" },
    { text: "Le plus suseceptible... De juger les gens selon leur signe astrologique", category: "divers" },
    { text: "Tout le monde change de place", category: "divers" },
    { text: "Le plsu susceptible d'avoir un nom pour son entre jambes boit", category: "divers" },
    { text: "Votons ! Le plus saoul donne sa consomation", category: "divers" },
    { text: "Le plsu susceptible d'avoir un nom pour son entre jambes boit", category: "divers" },
    //{ text: "Rebrasse le paquest au complet 😱", category: "divers" },
    { text: "tout le monde doit répondre à la 1er story", category: "divers" },
    //{ text: "Refais jouer une carte déjà jouée et choisie la victime", category: "divers" },
];

let names = getPlayersFromStorage();
let turn = 0;

// Logique de la page du jeu
document.addEventListener("DOMContentLoaded", () => {
    initGame();
});

function initGame() {
    cards = DECK;
    displayPlayers();
    drawCard();
}

function drawCard() {

    lastPlayerTurn();
    // Afficher la carte
    let cardDisplay = document.querySelector(".card-display");
    if(cards.length > 0) {
        let randomIndex = Math.floor(Math.random() * cards.length);
        let card = cards[randomIndex];
        if (cardDisplay) {
            cardDisplay.innerHTML = `
                <div class="card-category">${card.category[0].toUpperCase() + card.category.slice(1)}</div>
                <div class="card-text">${card.text}</div>
            `;
            cards.splice(randomIndex, 1); // Retirer la carte du deck
        }
    }
    else{
        if (cardDisplay) {
            cardDisplay.innerHTML = `
                <div class="card-category">Fin du deck</div>
                <div class="card-text">Rebrassez le paquet pour continuer à jouer !</div>
            `;
        }
    }

    playerTurn();
}

function playerTurn(){
    let playerElement = document.getElementById("player" + turn);
    if(playerElement) {
        playerElement.classList.add("active"); 
    }
    turn++;
    if(turn >= names.length) {
        turn = 0;
    }
}

function lastPlayerTurn(){
    let lastPlayerIndex = 0;
    if(turn === 0) {
        lastPlayerIndex = names.length - 1;
    } else {
        lastPlayerIndex = turn - 1;
    }
    let lastPlayerElement = document.getElementById("player" + lastPlayerIndex);
    if(lastPlayerElement) {
        lastPlayerElement.classList.remove("active"); 
    }
}

function displayPlayers() {
    let container = document.getElementById("players-info");
    for(let i = 0; i < names.length; i++) {
        let playerElement = document.createElement("div");
        playerElement.className = "player-badge";
        playerElement.textContent = names[i];
        playerElement.id = "player" + i;
        container.appendChild(playerElement);
    }
}

function acceuil(){
    clearAllPlayers();
    turn = 0;
    window.location.href = "index.html";
}
