const socket = io();

socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

socket.on("lobby_created", (data) => {
    console.log("Lobby created with ID:", data.lobby_id);
    window.location.href = "/lobby/" + data.lobby_id;
});

socket.on("lobby_joined", (data) => {
    console.log("Joined lobby with ID:", data.lobby_id);
    window.location.href = "/lobby/" + data.lobby_id;
});


socket.on("error", (data) => {
    alert(data.message);
});