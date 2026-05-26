// Logique de la page d'accueil

const createLobbyBtn = document.getElementById("create-lobby");
const joinLobbyBtn = document.getElementById("join-lobby");
const lobbyIdContainer = document.getElementById("lobby-id-container");
// Input fields
const playerNameInput = document.getElementById("player-name");
const lobbyIdInput = document.getElementById("lobby-id");

createLobbyBtn.addEventListener("click", createLobby);
joinLobbyBtn.addEventListener("click", joinLobby);


function createLobby() {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Please enter your name");
        return;
    }
    socket.emit("create_lobby", {
    playerName: playerName
    });
}

function joinLobby() {
    const playerName = playerNameInput.value.trim();
    const lobbyId = lobbyIdInput.value.trim();

    if (!playerName || !lobbyId) {
        alert("Please enter your name and lobby ID");
        return;
    }
    socket.emit("join_lobby", {
        playerName: playerName,
        lobbyId: lobbyId
    });
}
