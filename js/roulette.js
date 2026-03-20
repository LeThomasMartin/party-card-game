// Logique de la roulette

document.addEventListener("DOMContentLoaded", () => {
    initRoulette();
});

function initRoulette() {
    const players = getPlayersFromStorage();
    
    if (players.length === 0) {
        window.location.href = "index.html";
        return;
    }

    // Créer la roulette
    const rouletteWheel = document.querySelector(".roulette");
    if (rouletteWheel) {
        createRouletteWheel(players, rouletteWheel);
    }

    // Ajouter les boutons
    const rouletteControls = document.querySelector(".roulette-controls");
    if (rouletteControls) {
        const spinBtn = document.createElement("button");
        spinBtn.textContent = "🔄 Tourner !";
        spinBtn.onclick = () => spinRoulette(players);
        
        const gameBtn = document.createElement("button");
        gameBtn.className = "secondary";
        gameBtn.textContent = "Retour au jeu";
        gameBtn.onclick = () => window.location.href = "game.html";
        
        const homeBtn = document.createElement("button");
        homeBtn.className = "secondary";
        homeBtn.textContent = "Accueil";
        homeBtn.onclick = () => window.location.href = "index.html";
        
        rouletteControls.appendChild(spinBtn);
        rouletteControls.appendChild(gameBtn);
        rouletteControls.appendChild(homeBtn);
    }
}

function createRouletteWheel(players, container) {
    const colors = [
        "#ff6b6b", "#4ecdc4", "#ffd93d", "#a8e6cf",
        "#ff8b94", "#c7ceea", "#b5ead7", "#ffdac1"
    ];

    container.innerHTML = "";
    
    const segmentAngle = 360 / players.length;
    
    players.forEach((player, index) => {
        const segment = document.createElement("div");
        segment.className = "roulette-segment";
        segment.style.background = colors[index % colors.length];
        segment.style.transform = `rotate(${index * segmentAngle}deg)`;
        segment.textContent = player;
        container.appendChild(segment);
    });
}

function spinRoulette(players) {
    const roulette = document.querySelector(".roulette");
    const result = document.querySelector(".result");
    
    if (!roulette.classList.contains("spinning")) {
        roulette.classList.add("spinning");
        
        // Sélectionner un joueur aléatoire
        const selectedPlayer = players[Math.floor(Math.random() * players.length)];
        
        // Attendre la fin de l'animation
        setTimeout(() => {
            roulette.classList.remove("spinning");
            
            if (result) {
                result.innerHTML = `✨ ${selectedPlayer} ✨`;
            }
        }, 800);
    }
}
