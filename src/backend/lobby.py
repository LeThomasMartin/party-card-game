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

    if player_name in lobby["players"].values():
        emit("error", {"message": "Player name already taken"})
        return

    player_id = generate_player_id()  # Generate a unique player ID
    join_room(room)

    lobby["players"][player_id] = player_name
    lobby["connections"][request.sid] = player_id
    lobby["card_creation_done"][player_id] = False

    if not lobby["host"]:
        lobby["host"] = player_id


    emit( "store_player_id", {
    "player_id": player_id
    }, to=request.sid )

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

    player_id = lobby["connections"].get(sid)

    if player_id in lobby["players"]:
        del lobby["players"][player_id]  # Remove the player from the players dictionary

    if player_id == lobby["host"]:
        lobby["host"] = next(iter(lobby["players"]), None)

    leave_room(room)

    host_name = lobby["players"].get(lobby["host"]) if lobby["host"] else None

    lobby["players"].pop(player_id, None)  # Remove the player from the players dictionary
    lobby["card_creation_done"].pop(player_id, None)  # Remove the player's card creation status
    lobby["connections"].pop(sid, None)  # Remove the player's connection

    emit("update_players", {
        "room": room,
        "host": host_name,
        "players": list(lobby["players"].values())
    }, room=room)

@socketio.on("disconnect")
def on_disconnect(sid=None):
    if sid is None:
        sid = request.sid

    for room, lobby in lobbies.items():
        player_id = lobby["connections"].get(sid)
        if not player_id or player_id not in lobby["players"]:
            continue
        del lobby["players"][player_id]
        if player_id == lobby["host"]:
            lobby["host"] = next(iter(lobby["players"]), None)

        host_name = lobby["players"].get(lobby["host"]) if lobby["host"] else None
        
        lobby["players"].pop(player_id, None)  # Remove the player from the players dictionary
        lobby["card_creation_done"].pop(player_id, None)  # Remove the player's card creation status
        lobby["connections"].pop(sid, None)  # Remove the player's connection

        emit("update_players", {
            "room": room,
            "host": host_name,
            "players": list(lobby["players"].values())
        }, room=room)

def generate_room_id():
    return ''.join(str(random.randint(0, 9)) for _ in range(5))

def generate_player_id():
    return ''.join(str(random.randint(0, 9)) for _ in range(10))
