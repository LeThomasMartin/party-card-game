import os
from flask import Flask, render_template
from flask_socketio import SocketIO

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "../frontend/templates"),
    static_folder=os.path.join(BASE_DIR, "../frontend/static"),
    static_url_path="/static"
)

socketio = SocketIO(app)

from src.backend import lobby
from src.backend import api
from src.backend import game

@app.route("/")
def mainPage():
    return render_template("index.html")

@app.route("/lobby/<lobby_id>")
def lobby_page(lobby_id):
    lobby_data = lobby.lobbies.get(lobby_id)

    if not lobby_data:
        return "Lobby not found", 404

    return render_template(
        "lobby.html",
        lobby_id=lobby_id,)

@app.route("/lobby/cardCreation/<lobby_id>")
def card_creation(lobby_id):
    lobby_data = lobby.lobbies.get(lobby_id)

    if not lobby_data:
        return "Lobby not found", 404

    return render_template(
        "cardCreation.html",
        lobby_id=lobby_id,
    )

@app.route("/lobby/game/<lobby_id>")
def game_lobby(lobby_id):
    lobby_data = lobby.lobbies.get(lobby_id)

    if not lobby_data:
        return "Lobby not found", 404

    return render_template(
        "game.html",
        lobby_id=lobby_id,
    )
