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
    while room in lobby.lobbies:
        room = lobby.generate_room_id()

    lobby.lobbies[room] = {
        "host": None,

        "players": {
            # player_id: nom
            # "abc123": "Thomas",
            # "def456": "Alex"
        },

        "connections": {
            # sid: player_id
            # "RVqspr...": "abc123",
            # "ECfgyw...": "def456"
        },

        "card_creation_done": {
            # player_id: True/False
        },

        "deck": deck,
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

@app.route("/api/lobby/<room>/can_draw_card/<player_sid>")
def can_draw_card(room, player_sid):
    lobby_data = lobby.lobbies.get(room)

    if not lobby_data:
        return jsonify({
            "error": "Lobby not found"
        }), 404

    if lobby_data["active_player"] and lobby_data["active_player"]["sid"] == player_sid:
        return jsonify({"can_draw": True})
    else:
        return jsonify({"can_draw": False})