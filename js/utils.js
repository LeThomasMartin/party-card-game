// Utilitaires localStorage et autres fonctions globales

function getPlayersFromStorage() {
    const players = [];
    let i = 0;
    let playerName = localStorage.getItem("name" + i);
    
    while(playerName) {
        players.push(playerName);
        i++;
        playerName = localStorage.getItem("name" + i);
    }
    
    return players;
}

function savePlayersToStorage(names) {
    // Nettoyer d'abord
    let i = 0;
    while(localStorage.getItem("name" + i)) {
        localStorage.removeItem("name" + i);
        i++;
    }
    
    // Sauvegarder les nouveaux
    names.forEach((name, index) => {
        localStorage.setItem("name" + index, name);
    });
}

function clearAllPlayers() {
    let i = 0;
    while(localStorage.getItem("name" + i)) {
        localStorage.removeItem("name" + i);
        i++;
    }
}
