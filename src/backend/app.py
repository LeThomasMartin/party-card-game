import os
from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "../frontend/templates"),
    static_folder=os.path.join(BASE_DIR, "../frontend/static"),
    static_url_path="/static"
)

socketio = SocketIO(app)

@app.route("/")
def mainPage():
    return render_template("index.html")

@app.route("/game")
def gamePage():
    return render_template("game.html")

@app.route("/lobby/<lobby_id>")
def lobby_page(lobby_id):
    lobby = lobbies.get(lobby_id)

    if not lobby:
        return "Lobby not found", 404

    return render_template(
        "lobby.html",
        lobby_id=lobby_id,
        host_name=lobby["host"],
        players=lobby["players"]
    )



#Fichier lobby plus tard
import random
import string

lobbies = {}

@socketio.on("create_lobby")
def create_lobby(data):
    player_name = data["playerName"]

    lobby_id = generate_lobby_id()

    lobbies[lobby_id] = {
        "host": player_name,
        "players": [player_name],
        "state": "waiting"
    }

    print("Lobby created:", lobby_id, "by", player_name)
    join_room(lobby_id)
    print("CLIENT ROOMS:", rooms())
    emit("lobby_created", {
        "lobby_id": lobby_id
    })

@socketio.on("join_lobby")
def join_lobby(data):
    lobby_id = data["lobbyId"]
    player_name = data["playerName"]

    lobby = lobbies.get(lobby_id)

    if not lobby:
        emit("error", {"message": "Lobby not found"})
        return

    if lobby["state"] != "waiting":
        emit("error", {"message": "Lobby is not open for joining"})
        return

    if player_name in lobby["players"]:
        emit("error", {"message": "Player name already taken in this lobby"})
        return

    lobby["players"].append(player_name)

    print("Player", player_name, "joined lobby", lobby_id)


    emit("lobby_joined", {
        "lobby_id": lobby_id,
        "players": lobby["players"]
    },)

    join_room(lobby_id)
    print("CLIENT ROOMS:", rooms())

    emit("update_players", {
        "players": lobby["players"]
    }, broadcast=True)


def generate_lobby_id():
    return ''.join((str(random.randint(0, 9)) for i in range(6)))