const playersList = document.getElementById("players-list");
const startGameBtn = document.getElementById("start-game-btn");
const leaveLobbyBtn = document.getElementById("leave-lobby-btn");
const hostIndicator = document.getElementById("host-indicator");
const lobbyId = window.location.pathname.split("/").pop();
const lobbyNotification = document.getElementById("lobby-notification");
let previousPlayers = [];
let isInitialLobbySync = true;

leaveLobbyBtn.addEventListener("click", leaveLobby);
startGameBtn.addEventListener("click", startGame);

document.addEventListener("DOMContentLoaded", () => {
    const savedName = sessionStorage.getItem("playerName");
    if (savedName) {
        socket.emit("join_room", { playerName: savedName, room: lobbyId });
    }
    getPlayers(lobbyId);
});

socket.on("update_players", (data) => {
    showPlayerNotifications(data.players);
    updatePlayersList(data.players);
    updateHostInfo(data.host);
});

function updateHostInfo(hostName) {
    const hostInfo = document.getElementById("host-info");
    hostInfo.textContent = "Hôte : " + (hostName || "Aucun hôte");
    displayStartGameButton(hostName);
}

function updatePlayersList(players) {
    const addedPlayers = players.filter((name) => !previousPlayers.includes(name));
    playersList.innerHTML = "";

    players.forEach((player) => {
        const li = document.createElement("li");
        li.textContent = player;
        li.className = "player-card";

        if (addedPlayers.includes(player)) {
            li.classList.add("entered");
        }

        playersList.appendChild(li);
    });

    previousPlayers = [...players];
}

function showPlayerNotifications(currentPlayers) {
    if (isInitialLobbySync) {
        isInitialLobbySync = false;
        return;
    }

    const addedPlayers = currentPlayers.filter((name) => !previousPlayers.includes(name));
    const removedPlayers = previousPlayers.filter((name) => !currentPlayers.includes(name));

    if (addedPlayers.length > 0) {
        showLobbyNotification(`${addedPlayers.join(", ")} ${addedPlayers.length === 1 ? "a rejoint" : "ont rejoint"} le lobby !`);
    }

    if (removedPlayers.length > 0) {
        showLobbyNotification(`${removedPlayers.join(", ")} ${removedPlayers.length === 1 ? "a quitté" : "ont quitté"} le lobby...`, "warning");
    }
}

function showLobbyNotification(message, type = "success") {
    if (!lobbyNotification) return;
    lobbyNotification.textContent = message;
    lobbyNotification.className = "notification-toast show";
    lobbyNotification.style.borderColor = type === "warning" ? "rgba(249, 115, 22, 0.35)" : "rgba(99, 102, 241, 0.24)";

    clearTimeout(lobbyNotification.hideTimeout);
    lobbyNotification.hideTimeout = setTimeout(() => {
        lobbyNotification.className = "notification-toast";
    }, 3200);
}

async function getPlayers(lobbyId) {
    const response = await fetch(`/api/lobby/${lobbyId}/players`);
    const data = await response.json();
    
    if (!response.ok || data.error) {
        console.error("Error fetching players:", data.error || "Unknown error");
        return;
    }
    
    if (data.players && Array.isArray(data.players)) {
        updatePlayersList(data.players);
    }
}

async function getHostName(lobbyId) {
    const response = await fetch(`/api/lobby/${lobbyId}/host`);
    const data = await response.json();
    return data.host;
}

async function displayStartGameButton(hostName) {
    const isHost = hostName === sessionStorage.getItem("playerName");
    if (isHost) {
        startGameBtn.style.display = "block";
        if (hostIndicator) {
            hostIndicator.style.display = "block";
        }
    } else {
        startGameBtn.style.display = "none";
        if (hostIndicator) {
            hostIndicator.style.display = "none";
        }
    }
}

function leaveLobby() {
    socket.emit("leave_lobby", { room: lobbyId });
    window.location.href = "/";
}

function startGame() {
    socket.emit("start_game", { room: lobbyId });
    window.location.href = "/lobby/game/" + lobbyId;
}

socket.on("game_started", (data) => {
    console.log("Game started, redirecting to game page...");
    window.location.href = "/lobby/game/" + data.room;
});