// Logique de la page d'accueil

const createLobbyBtn = document.getElementById("create-lobby");
const joinLobbyBtn = document.getElementById("join-lobby");
const lobbyIdContainer = document.getElementById("lobby-id-container");
// Input fields
const playerNameInput = document.getElementById("player-name");
const lobbyIdInput = document.getElementById("lobby-id");

createLobbyBtn.addEventListener("click", createLobby);
joinLobbyBtn.addEventListener("click", joinLobby);


async function createLobby() {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Please enter your name");
        return;
    }
    const response = await fetch(`/api/lobby/create`);
    const data = await response.json();
    sessionStorage.setItem("playerName", playerName);
    window.location.href = "/lobby/" + data.room;
}

 async function joinLobby() {
    const playerName = playerNameInput.value.trim();
    const room = lobbyIdInput.value.trim();

    if (!playerName || !room) {
        alert("Please enter your name and lobby ID");
        return;
    }
    if (!(await fetch(`/lobby/${room}`, { method: "GET"})).ok) {
        console.log("Lobby introuvable");
        alert("Lobby not found");
        return;
    }
    const res = await fetch(`/api/lobby/${room}/players`);
    const data = await res.json();
    if (!res.ok || data.error) {
        console.error("Error fetching players:", data.error || "Unknown error");
        alert("Error checking lobby");
        return;
    }

    if (data.players && Array.isArray(data.players) && data.players.includes(playerName)) {
        console.log("Nom déjà pris dans ce lobby");
        alert("Name already taken in this lobby");
        return;
    }
    sessionStorage.setItem("playerName", playerName);
    window.location.href = "/lobby/" + room;
}
