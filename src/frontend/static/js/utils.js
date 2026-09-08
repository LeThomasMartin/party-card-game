// Utilitaires localStorage et autres fonctions globales

function savePlayerToStorage(name) {
    localStorage.setItem("playerName", name);
}

function getPlayerFromStorage() {
    return localStorage.getItem("playerName");
}

function clearPlayerFromStorage() {
    localStorage.removeItem("playerName");
}
