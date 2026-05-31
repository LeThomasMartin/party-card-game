const playersList = document.getElementById("players-list");
const startGameBtn = document.getElementById("start-game-btn");
const leaveLobbyBtn = document.getElementById("leave-lobby-btn");
const lobbyId = window.location.pathname.split("/").pop();

leaveLobbyBtn.addEventListener("click", leaveLobby);


document.addEventListener("DOMContentLoaded", () => {
    const savedName = sessionStorage.getItem("playerName");
    if (savedName) {
        socket.emit("join_room", { playerName: savedName, room: lobbyId });
    }
    getPlayers(lobbyId);
});

socket.on("update_players", (data) => {
    console.log("Received player update:", data);
    updatePlayersList(data.players);
    updateHostInfo(data.host);
});

function updateHostInfo(hostName) {
    const hostInfo = document.getElementById("host-info");
    hostInfo.textContent = "Host: " + (hostName || "No host");
    displayStartGameButton(hostName);
}

function updatePlayersList(players) {
    playersList.innerHTML = "";
    players.forEach((player) => {
        const li = document.createElement("li");
        li.textContent = player;
        playersList.appendChild(li);
    });
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
    console.log("Is current player the host?", isHost);
    console.log("Host name:", hostName, "Current player name:", sessionStorage.getItem("playerName"));
    if (isHost) {
        startGameBtn.style.display = "block";
    } else {
        startGameBtn.style.display = "none";
    }
}

function leaveLobby() {
    console.log("Leaving lobby...");
    socket.emit("leave_lobby", { room: lobbyId });
    window.location.href = "/";
}