const lobbyId = window.location.pathname.split("/").pop();

function startGame() {
    socket.emit("start_game", { room: lobbyId });
    window.location.href = "/lobby/game/" + lobbyId;
}

socket.on("game_started", (data) => {
    window.location.href = "/lobby/game/" + data.room;
});