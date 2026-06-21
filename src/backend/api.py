from flask import jsonify
from src.backend.app import app
from src.backend import lobby
from src.backend.data import deck
import random

@app.route("/api/lobby/<room>/players")
def get_players(room):
    lobby_data = lobby.lobbies.get(room)

    if not lobby_data:
        return jsonify({
            "error": "Lobby not found"
        }), 404

    return jsonify({
        "players": list(lobby_data["players"].values()),
        "player_count": len(lobby_data["players"])
    })

@app.route("/api/lobby/<room>/host")
def get_host(room):
    lobby_data = lobby.lobbies.get(room)

    if not lobby_data:
        return jsonify({
            "error": "Lobby not found"
        }), 404

    return jsonify({
        "host": lobby_data["players"][lobby_data["host"]]
    })

@app.route("/api/lobby/create")
def create_lobby():
    room = lobby.generate_room_id()
    lobby.lobbies[room] = {
        "host": None,
        "players": {},
        "deck": deck, # Deck par défaut pour l'instant, peut être personnalisé plus tard
        "active_player": None,
        "turn": 0,
        "state": "waiting"
    }

    return jsonify({"room": room})

@app.route("/api/lobby/<room>/deck")
def get_deck(room):
    lobby_data = lobby.lobbies.get(room)

    if not lobby_data:
        return jsonify({
            "error": "Lobby not found"
        }), 404

    return jsonify({
        "deck": random.shuffle(lobby_data["deck"])
    })