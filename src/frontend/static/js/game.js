let drawButton = document.getElementById("draw-button");
let waitingForWheelClick = false;
let drawButtonMode = "draw"; // Modes: "draw", "wheel", "endgame"
let wheelEngine = null;
const room = window.location.pathname.split("/").pop();
let players_names = [];
let players_sids = [];
let active_player_sid = null;
let active_player_name = null;
let previous_active_player = null;

drawButton.addEventListener("click", async () => {
    if (drawButtonMode === "draw") {
        socket.emit("draw_card", {"room": room});
        socket.emit("next_player", {"room": room});
    } else if (drawButtonMode === "wheel") {
        // This case is handled in changeCardText function, so we just ignore clicks here
    } else if (drawButtonMode === "endgame") {
        resetGame();
    }
});

// Logique de la page du jeu
document.addEventListener("DOMContentLoaded", () => {
    socket.emit("init_game", {"room": room});
});

socket.on("game_initialized", (data) => {
    // Initialize wheel engine
    const canvas = document.getElementById("wheel");
    if (canvas) {
        wheelEngine = new WheelEngine(canvas);
        wheelEngine.debugMode = WHEEL_CONFIG.debug.enabled;
    }


    hideWheel();
    active_player_sid = data.active_player.sid;
    active_player_name = data.active_player.name;
    players_names = data.players_names;
    players_sids = data.players_sids;
    displayPlayers();
    socket.emit("draw_card", {"room": room});
    playerTurn(active_player_sid);
});

socket.on("card_drawn", async (data) => {
    drawCard(data.card);
});

async function drawCard(card) {
    // Player turn is managed by backend via player_changed event
    let cardDisplay = document.querySelector(".card-display");

    const hasRandom = card.text.includes("[random]");
    let displayedText = card.text;

    if (displayedText.includes("[player]")) {
        displayedText = displayedText.replace("[player]", active_player_name);
    }

    if (hasRandom) {
        displayedText = displayedText.replace("[random]", "...");
    }

    cardDisplay.className = "card-display category-" + card.category;
    cardDisplay.innerHTML = `
    <div class="card-category">${card.category[0].toUpperCase() + card.category.slice(1)}</div>
    <div class="card-text">${displayedText}</div>
    `;

    if (hasRandom) {
        const finalText = await changeCardText(displayedText);
        
        cardDisplay.innerHTML = `
        <div class="card-category">${card.category[0].toUpperCase() + card.category.slice(1)}</div>
        <div class="card-text">${finalText}</div>
        `;
    }

    if (card.effect) {
        handleCardEffect(card);
    }

    turn++;
}

async function changeCardText(text) {
    drawButton.textContent = "Tourner la roue !";
    drawButtonMode = "wheel";
    await waitForWheelButtonClick();

    drawButton.disabled = true;
    let winner = await spinWheelForRandom();

    text = text.replace("...", winner);

    drawButton.textContent = "Prochaine carte";
    drawButtonMode = "draw";
    drawButton.disabled = false;

    return text;
}

function waitForWheelButtonClick() {
    return new Promise((resolve) => {
        waitingForWheelClick = true;

        const handler = () => {
            drawButton.removeEventListener("click", handler);
            resolve();
        };

        drawButton.addEventListener("click", handler);
    });
}

async function spinWheelForRandom() {
    if (!wheelEngine) {
        console.error('⚠ Wheel engine not initialized');
        return null;
    }

    // Load player names excluding current player
    const wheelEntries = players_names.filter((_, idx) => idx !== (turn % players_names.length));
    
    if (wheelEntries.length === 0) {
        console.warn('⚠ No other players available for wheel spin');
        return players_names[turn % players_names.length];
    }

    // Update wheel with weighted entries (equal weight by default)
    wheelEngine.updateEntries(
        wheelEntries.map(name => new WeightedEntry(name, 1))
    );
    wheelEngine.draw();

    showWheel();
    
    // Spin the wheel
    const winner = await wheelEngine.spin();
    
    hideWheel();
    
    return winner ? winner.name : null;
}

function endGame() {
        // Remove active state from all players
        for (let i = 0; i < players_sids.length; i++) {
            let playerElement = document.getElementById(players_sids[i]);
            if (playerElement) {
                playerElement.classList.remove("active");
            }
        }
        
        let cardDisplay = document.querySelector(".card-display");
        cardDisplay.className = "card-display endgame";
        cardDisplay.innerHTML = `
            <div class="card-category">🎉 FIN DU DECK 🎉</div>
            <div class="card-text">Merci d'avoir joué !</div>
            <div class="endgame-subtitle">Rebrassez le paquet pour continuer à jouer !</div>
        `;

        drawButton.textContent = "Merci d'avoir joué !";
        drawButton.disabled = true;
        
        // Add endgame effect to body
        endGameEffect();
        // Enable restart button after 2 seconds
        setTimeout(() => {
            drawButton.textContent = "Rebrasser le deck";
            drawButtonMode = "endgame";
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

socket.on("player_changed", (data) => {
    previous_active_player = active_player_sid;
    lastPlayerTurn();
    active_player_sid = data.active_player.sid;
    active_player_name = data.active_player.name;
    playerTurn(active_player_sid);
});

function playerTurn(activePlayer){
    if (activePlayer === null || activePlayer === undefined) {
        return;
    }
    let playerElement = document.getElementById(activePlayer);
    if(playerElement) {
        playerElement.classList.add("active"); 
    }
}

function lastPlayerTurn(){
    if (previous_active_player !== null && previous_active_player !== undefined) {
        let lastPlayerElement = document.getElementById(previous_active_player);
        if(lastPlayerElement) {
            lastPlayerElement.classList.remove("active"); 
        }
    }
}

function displayPlayers() {
    let container = document.getElementById("players-info");
    if(players_names.length == players_sids.length) {
        for(let i = 0; i < players_names.length; i++) {
            let playerElement = document.createElement("div");
            playerElement.className = "player-badge";
            playerElement.textContent = players_names[i];
            playerElement.id = players_sids[i];
            container.appendChild(playerElement);
        }
    }
    else {
        console.error("Mismatch between players and player SIDs");
    }
}

function handleCardEffect(card) {

    switch(card.effect) {
        case "shuffleDeck":
            socket.emit("reshuffle_deck", {"room": room});
            break;
        default:
            break;
    }
}

socket.on("reshuffled_deck", () => {
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
});

function resetGame() {
    socket.emit("reshuffle_deck", {"room": room});
    turn = 0; // Réinitialiser le tour
    if (drawButton) {
        drawButton.textContent = "Prochaine Carte";
        drawButtonMode = "draw";
    }
    
    // Remove endgame overlay if it exists
    let existingOverlay = document.querySelector(".endgame-overlay");
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    socket.emit("reset_game", {"room": room});
}

function acceuil(){
    clearAllPlayers();
    turn = 0;
    window.location.href = "/";
}