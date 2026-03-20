// Deck de cartes pour le jeu
const DECK = [
    // BOISSON
    { text: "Tout le monde boit !", category: "boisson" },
    { text: "[PLAYER] choisit qui boit le plus", category: "boisson" },
    { text: "Les garçons boivent une gorgée", category: "boisson" },
    { text: "Les filles boivent une gorgée", category: "boisson" },
    { text: "[PLAYER] doit boire les 3 prochaines gorgées de quelqu'un d'autre", category: "boisson" },
    { text: "Chacun boit autant de fois qu'il a de lettres dans son prénom", category: "boisson" },
    { text: "Le plus jeune boit", category: "boisson" },
    { text: "Le plus vieux boit", category: "boisson" },
    { text: "[PLAYER] distribue 3 gorgées où il veut", category: "boisson" },
    
    // PARLER
    { text: "Dis un compliment sincère à [PLAYER]", category: "parler" },
    { text: "Raconte ta plus grande peur à voix haute", category: "parler" },
    { text: "Fais une meilleure imitation que [PLAYER]", category: "parler" },
    { text: "Crie le secret le plus embarrassant que tu connaisses (inventé)", category: "parler" },
    { text: "Parle avec un accent jusqu'à la prochaine carte", category: "parler" },
    { text: "[PLAYER] pose une question à qui il veut", category: "parler" },
    { text: "Décris ton meilleur souvenir en 30 secondes", category: "parler" },
    
    // DÉFI
    { text: "Fais 5 pompes", category: "défi" },
    { text: "Danse comme si personne ne regardait pendant 15 secondes", category: "défi" },
    { text: "[PLAYER] et [PLAYER] se battent en air guitar", category: "défi" },
    { text: "Fais un défi d'imitation avec [PLAYER]", category: "défi" },
    { text: "Lance un objet et attrape-le 3 fois sans le casser", category: "défi" },
    { text: "Fais reculer tout le monde en chantant très fort", category: "défi" },
    { text: "Tiens sur une jambe pendant que la prochaine carte se lit", category: "défi" },
    
    // DIVERS
    { text: "Le prochain à arriver à la fête doit faire quelque chose de crazyyy", category: "divers" },
    { text: "Tous ceux avec les yeux bleus changent de place", category: "divers" },
    { text: "[PLAYER] devient le roi/la reine jusqu'à la prochaine carte", category: "divers" },
    { text: "Tout le monde fait un toast à [PLAYER]", category: "divers" },
    { text: "Mets-toi d'accord avec [PLAYER] sur quelque chose", category: "divers" },
    { text: "Compte jusqu'à 100 en murmurant", category: "divers" },
    { text: "Celui qui rit en premier après cette carte perd", category: "divers" },
];

let usedCards = [];
let lastShownCard = null;

// Logique de la page du jeu
document.addEventListener("DOMContentLoaded", () => {
    initGame();
});

function initGame() {
    const players = getPlayersFromStorage();
    
    if (players.length === 0) {
        window.location.href = "index.html";
        return;
    }

    // Afficher les joueurs
    const playersInfo = document.querySelector(".players-info");
    if (playersInfo) {
        players.forEach(player => {
            const badge = document.createElement("div");
            badge.className = "player-badge";
            badge.textContent = player;
            playersInfo.appendChild(badge);
        });
    }

    // Ajouter les boutons
    const gameControls = document.querySelector(".game-controls");
    if (gameControls) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Prochaine Carte";
        nextBtn.onclick = () => drawCard(players);
        
        const rouletteBtn = document.createElement("button");
        rouletteBtn.className = "secondary";
        rouletteBtn.textContent = "🎡 Roulette";
        rouletteBtn.onclick = () => goToRoulette();
        
        const homeBtn = document.createElement("button");
        homeBtn.className = "secondary";
        homeBtn.textContent = "Accueil";
        homeBtn.onclick = () => window.location.href = "index.html";
        
        gameControls.appendChild(nextBtn);
        gameControls.appendChild(rouletteBtn);
        gameControls.appendChild(homeBtn);
    }

    // Afficher la première carte automatiquement
    drawCard(players);
}

function drawCard(players) {
    // Si toutes les cartes sont utilisées, réinitialiser
    if (usedCards.length >= DECK.length) {
        usedCards = [];
    }

    // Trouver une carte non utilisée
    let card;
    let attempts = 0;
    do {
        card = DECK[Math.floor(Math.random() * DECK.length)];
        attempts++;
    } while (usedCards.includes(card) && attempts < DECK.length);

    usedCards.push(card);
    lastShownCard = card;

    // Remplacer les [PLAYER] par des noms aléatoires
    let displayText = card.text;
    const playerMatches = displayText.match(/\[PLAYER\]/g);
    
    if (playerMatches) {
        playerMatches.forEach(() => {
            // Éviter de répéter le même joueur deux fois si possible
            let selectedPlayer = players[Math.floor(Math.random() * players.length)];
            displayText = displayText.replace("[PLAYER]", selectedPlayer);
        });
    }

    // Afficher la carte
    const cardDisplay = document.querySelector(".card-display");
    if (cardDisplay) {
        cardDisplay.innerHTML = `
            <div class="card-category">${card.category}</div>
            <div class="card-text">${displayText}</div>
        `;
    }
}

function goToRoulette() {
    window.location.href = "roulette.html";
}
