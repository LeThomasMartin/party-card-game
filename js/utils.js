// Utilitaires localStorage et autres fonctions globales


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
