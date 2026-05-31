from flask_socketio import emit, join_room, rooms, leave_room
from src.backend.app import socketio
from flask import request
import random

lobbies = {}

@socketio.on("join_room")
def join_lobby(data):
    room = data.get("room")
    player_name = data.get("playerName")


    if not player_name:
        emit("error", {"message": "Player name is required"})
        return

    if not room:
        emit("error", {"message": "Room ID is required"})
        return

    lobby = lobbies.get(room)

    if not lobby:
        emit("error", {"message": "Lobby not found"})
        return
    
    if lobby["state"] != "waiting":
        emit("error", {"message": "Game already started"})
        return

    if player_name in lobby["players"]:
        emit("error", {"message": "Player name already taken"})
        return

    sid = request.sid
    lobby["players"][sid] = player_name
    join_room(room)

    if not lobby["host"]:
        lobby["host"] = sid

    emit("update_players", {
    "room": room,
    "host": lobby["players"][lobby["host"]],
    "players": list(lobby["players"].values())
    }, room=room)

@socketio.on("leave_lobby")
def leave_lobby(data):
    room = data.get("room")
    sid = request.sid
    lobby = lobbies.get(room)

    if not lobby:
        emit("error", {"message": "Lobby not found"})
        return

    if sid in lobby["players"].keys():
        del lobby["players"][sid]

    if sid == lobby["host"]:
        lobby["host"] = next(iter(lobby["players"]), None)

    leave_room(room)

    emit("update_players", {
        "room": room,
        "host": lobby["players"][lobby["host"]],
        "players": list(lobby["players"].values())
    }, room=room)

@socketio.on("disconnect")
def on_disconnect():
    sid = request.sid

    for room, lobby in lobbies.items():
        if sid not in lobby["players"]:
            continue
        del lobby["players"][sid]
        if sid == lobby["host"]:
            lobby["host"] = next(iter(lobby["players"]), None)

        emit("update_players", {
            "room": room,
            "host": lobby["players"][lobby["host"]],
            "players": list(lobby["players"].values())
        }, room=room)

def generate_room_id():
    return ''.join(str(random.randint(0, 9)) for _ in range(5))


#=========================
#       Requests(api)
#=========================

from flask import jsonify
from src.backend.app import app

@app.route("/api/lobby/<room>/players")
def get_players(room):
    lobby = lobbies.get(room)

    if not lobby:
        return jsonify({
            "error": "Lobby not found"
        }), 404

    return jsonify({
        "players": list(lobby["players"].values()),
        "player_count": len(lobby["players"])
    })

@app.route("/api/lobby/<room>/host")
def get_host(room):
    lobby = lobbies.get(room)

    if not lobby:
        return jsonify({
            "error": "Lobby not found"
        }), 404

    return jsonify({
        "host": lobby["players"][lobby["host"]]
    })

@app.route("/api/lobby/create")
def create_lobby():
    room = generate_room_id()
    lobbies[room] = {
        "host": None,
        "players": {},
        "state": "waiting"
    }

    return jsonify({"room": room})
