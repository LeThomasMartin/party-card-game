const playersList = document.getElementById("players-list");

socket.on("update_players", (data) => {
    playersList.innerHTML = "";
    data.players.forEach((player) => {
        const li = document.createElement("li");
        li.textContent = player;
        playersList.appendChild(li);
    });
});