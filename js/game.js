// Deck de cartes pour le jeu
const DECK = [

    // BOISSON
    { id: 1, text: "Les gars boivent", category: "boisson" },
    { id: 2, text: "Les filles boivent", category: "boisson" },
    { id: 3, text: "Drinking race !", category: "boisson" },
    { id: 4, text: "Prend un SHOT!", category: "boisson" },
    { id: 5, text: "Donne deux gorgées", category: "boisson" },
    { id: 6, text: "Ta gauche et ta droite boivent", category: "boisson" },
    { id: 7, text: "Celui qui a le moins bu termine sa boisson", category: "boisson" },
    { id: 8, text: "finis ta boisson !", category: "boisson" },
    { id: 9, text: "Gorgée générale !", category: "boisson" },
    { id: 10, text: "[player] prend une gorgée", category: "boisson" },
    { id: 11, text: "[player] donne 2 shots", category: "boisson" },
    { id: 12, text: "Ceux en couple boivent", category: "boisson" },
    { id: 37, text: "[player] peux donner de 1 à 10 gorgées à [random]", category: "défi" }, // Pas de base

    // PARLER
    { id: 13, text: "Quel est le truc le plus BDSM que tu as fait ?", category: "parler" },
    { id: 14, text: "Raconte ta pire annectode de sexe", category: "parler" },
    { id: 15, text: "Selon toi... qui est le moins bien habillé dans la pièce ?", category: "parler" },
    { id: 16, text: "Si tu devais changer de vie avec une personne dans la piece ce serait qui ?", category: "parler" },
    { id: 17, text: "Excepté ton partenaire avec qui sortirais-tu dans la pièce ?", category: "parler" },
    { id: 18, text: "[player] quel est ton plus grand fantasme ?", category: "parler" },
    { id: 19, text: "Avec qui voudrais-tu le moins être en couple dans la pièce ?", category: "parler" },
    { id: 20, text: "[player] pose la question de ton choix à la personnne de ton choix", category: "parler" },
    { id: 21, text: "Qui appellerais tu dans la pièce pour t'aider à cacher un corps ?", category: "parler" },
    { id: 22, text: "Quelle est ta pire perte d'argent ?", category: "parler" },
    { id: 23, text: "À quand remonte ton dernier orgasme ?", category: "parler" },
    { id: 24, text: "Quel est le truc le plus illégal que tu as fait ?", category: "parler" }, // Pas de base

    // DÉFI
    { id: 25, text: "Change un bout de vêtement avec la personne en face", category: "défi" },
    { id: 26, text: "Avale un oeuf cru", category: "défi" },
    { id: 27, text: "La personne de ton choix te fait un belly shot", category: "défi" },
    { id: 28, text: "Drink un shot ! mystère", category: "défi" },
    { id: 29, text: "Laisse les gens texter à une personne avec ton cell (pas le droit de suprimmer avant demain)", category: "défi" },
    { id: 30, text: "Sort dehors deux bonnes minutes ", category: "défi" },
    { id: 31, text: "Laisse les gens fouiller dans ton cell 2 bonnes minutes", category: "défi" },
    { id: 32, text: "Kiss ton partenaire en ayant une gorgée (Transfert la)", category: "défi" },
    { id: 33, text: "Fais un tour de la bâtisse. Pas le droit de mettre un manteau ou des bottes", category: "défi" },
    { id: 34, text: "Enlève un bout de vêtement", category: "défi" },
    { id: 35, text: "Fait 15 push-up (les filles ont le droit au genoux) 💪", category: "défi" },
    { id: 36, text: "Appel le dernier numéro a qui tu as parlé. Pas le droit de racrocher avant 1 minutes (s'il répond pas passe au suivant)", category: "défi" },
    { id: 37, text: "[player] doit faire un massage à [random]", category: "défi" }, // Pas de base
    
    // DIVERS
    { id: 38, text: "Votons ! La personne qui déçoit le plus ses parents boit", category: "divers" },
    { id: 39, text: "Votons ! Le plus résistant à l'alcool finit sa boisson", category: "divers" },
    { id: 40, text: "Ont prend un selfi tout le monde ensemble", category: "divers" },
    { id: 41, text: "Jeu de la carte bisou", category: "divers" },
    { id: 42, text: "Le plus suseceptible... De juger les gens selon leur signe astrologique", category: "divers" },
    { id: 43, text: "Tout le monde change de place", category: "divers" },
    { id: 44, text: "Votons ! Le plus saoul donne sa consomation", category: "divers" },
    { id: 45, text: "Le plus susceptible d'avoir un nom pour son entre jambes boit", category: "divers" },
    { id: 46, text: "tout le monde doit répondre à la 1er story", category: "divers" },
    { id: 47, text: "Rebrasse le deck au complet 😱", category: "divers", effect: "shuffleDeck" },
    //{ id: 48, text: "Refais jouer une carte déjà jouée et choisie la victime", category: "divers" },

];

let names = getPlayersFromStorage();
let turn = 0;

// Logique de la page du jeu
document.addEventListener("DOMContentLoaded", () => {
    initGame();
});

function initGame() {
    shuffleDeck();
    displayPlayers();
    drawCard();
}

function drawCard() {
    lastPlayerTurn();

    let cardDisplay = document.querySelector(".card-display");

    if (cards.length > 0) {
        let randomIndex = Math.floor(Math.random() * cards.length);
        let card = cards[randomIndex];

        if(card.text.includes("[player]") || card.text.includes("[random]")) {
            card.text = changeCardText(card.text);
        }

        cardDisplay.className = "card-display category-" + card.category;
        cardDisplay.innerHTML = `
            <div class="card-category">${card.category[0].toUpperCase() + card.category.slice(1)}</div>
            <div class="card-text">${card.text}</div>
        `;
        if(card.effect){
            handleCardEffect(card);
        }
        cards.splice(randomIndex, 1);
    } else {
        endGame();
    }

    playerTurn();
}

function changeCardText(text) {
    let playerName = names[turn];
    let randomName = names[Math.floor(Math.random() * names.length)];
    text = text.replace("[player]", playerName);
    if (text.includes("[random]")) {
        // Roulette animation for random name pour plus tard
        text = text.replace("[random]", randomName);
    }
    return text;
}

function endGame() {
        let cardDisplay = document.querySelector(".card-display");
        cardDisplay.className = "card-display endgame";
        cardDisplay.innerHTML = `
            <div class="card-category">🎉 FIN DU DECK 🎉</div>
            <div class="card-text">Merci d'avoir joué !</div>
            <div class="endgame-subtitle">Rebrassez le paquet pour continuer à jouer !</div>
        `;

        let drawButton = document.getElementById("draw-button");
        drawButton.textContent = "Merci d'avoir joué !";
        drawButton.disabled = true;
        
        // Add endgame effect to body
        endGameEffect();
        
        // Enable restart button after 2 seconds
        setTimeout(() => {
            drawButton.textContent = "Rebrasser le deck";
            drawButton.onclick = resetGame;
            drawButton.disabled = false;
        }, 2000);

}

function endGameEffect() {

    let gameContainer = document.querySelector(".game-container");
    // Remove existing overlay if any
    let existingOverlay = document.querySelector(".endgame-overlay");
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Create endgame overlay
    let overlay = document.createElement("div");
    overlay.className = "endgame-overlay";
    gameContainer.appendChild(overlay);
    
    // Create confetti particles
    for (let i = 0; i < 30; i++) {
        let particle = document.createElement("div");
        particle.className = "confetti";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.animationDelay = (Math.random() * 0.5) + "s";
        particle.style.animationDuration = (Math.random() * 2 + 2) + "s";
        overlay.appendChild(particle);
    }
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

function handleCardEffect(card) {

    switch(card.effect) {
        case "shuffleDeck":
            shuffleDeck();
            cards = cards.filter(c => c.id !== card.id);
            break;
        default:
            break;
    }
}


function shuffleDeck() {
    let cardDisplay = document.querySelector(".card-display");
    
    // Apply card flip animation
    cardDisplay.style.animation = 'none';
    
    // Trigger reflow to restart animation
    void cardDisplay.offsetWidth;
    
    cardDisplay.style.animation = 'cardFlip 0.6s ease-in-out';
    
    // Reset animation after it completes so it can be replayed
    cardDisplay.addEventListener('animationend', () => {
        cardDisplay.style.animation = '';
    }, { once: true });
    
    // Reshuffle the deck
    cards = [...DECK];
}

function resetGame() {
    shuffleDeck();
    turn = 0; // Réinitialiser le tour
    let drawButton = document.getElementById("draw-button");
    if (drawButton) {
        drawButton.textContent = "Prochaine Carte";
        drawButton.onclick = drawCard;
    }
    
    // Remove endgame overlay if it exists
    let existingOverlay = document.querySelector(".endgame-overlay");
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    drawCard(); // Afficher la première carte
}

function acceuil(){
    clearAllPlayers();
    turn = 0;
    window.location.href = "index.html";
}
