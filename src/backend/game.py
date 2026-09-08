from flask_socketio import emit, join_room, rooms, leave_room
from src.backend.app import socketio
from src.backend.data import deck
from flask import request
from src.backend import lobby
import random


# =====Card creation events======
@socketio.on("card_creation")
def card_creation(data):
    room = data.get("room")
    join_room(room)
    lobby_data = lobby.lobbies.get(room)
        
    if not lobby_data:
        emit("error", {"message": "Lobby not found"})
        return

    lobby_data["state"] = "card_creation"
    lobby_data["deck"] = []  # Reset the deck for new card creation

    if lobby_data["state"] != "card_creation":
        emit("error", {"message": "Game already started"})
        return

    emit("create_cards", {"room": room}, room=room)

@socketio.on("submit_cards")
def submit_cards(data):
    room = data.get("room")
    player_id = data.get("player_id")
    cards = data.get("cards")
    join_room(room)
    lobby_data = lobby.lobbies.get(room)
    sid = request.sid

    if not lobby_data:
        emit("error", {"message": "Lobby not found"})
        return

    if lobby_data["state"] != "card_creation":
        emit("error", {"message": "Invalid game state"})
        return
    if sid not in lobby_data["connections"]:
        update_connexion_info(sid, player_id, room)

    lobby_data["deck"] += cards
    lobby_data["card_creation_done"][player_id] = True


    players_done = [
        lobby_data["players"][player_id]
        for player_id, done in lobby_data["card_creation_done"].items()
        if done
    ]

    players_not_done = [
        lobby_data["players"][player_id]
        for player_id, done in lobby_data["card_creation_done"].items()
        if not done
    ]

    if len(players_not_done) == 0:
        lobby_data["state"] = "waiting"
        start_game(data)  # Start the game automatically when all players are done

    emit("cards_submitted", {"room": room, "players_done": players_done, "players_not_done": players_not_done}, room=room)

@socketio.on("start_game")
def start_game(data):
    room = data.get("room")
    join_room(room)
    lobby_data = lobby.lobbies.get(room)

    if not lobby_data:
        emit("error", {"message": "Lobby not found"})
        return

    if lobby_data["state"] != "waiting" and lobby_data["state"] != "card_creation":
        emit("error", {"message": "Game already started"})
        return
    lobby_data["state"] = "playing"
    emit("game_started", {"room": room}, room=room)

@socketio.on("init_game")
def init_game(data):
    room = data.get("room")
    join_room(room)
    lobby_data = lobby.lobbies.get(room)

    if not lobby_data:
        emit("error", {"message": "Lobby not found"})
        return

    if lobby_data["state"] != "playing":
        emit("error", {"message": "Game not started"})
        return

    first_sid = list(lobby_data["players"].keys())[0]
    first_name = lobby_data["players"][first_sid]
    lobby_data["active_player"] = {"sid": first_sid, "name": first_name}

    emit("game_initialized", {"room": room, "active_player": lobby_data["active_player"], "players_names": list(lobby_data["players"].values()), "players_sids": list(lobby_data["players"].keys())})

@socketio.on("next_player")
def next_player(data):
    room = data.get("room")
    join_room(room)
    lobby_data = lobby.lobbies.get(room)

    if not lobby_data:
        emit("error", {"message": "Lobby not found"})
        return

    if lobby_data["state"] != "playing":
        emit("error", {"message": "Game not started"})
        return

    player_sids = list(lobby_data["players"].keys())
    current_sid = lobby_data["active_player"]["sid"]
    current_index = player_sids.index(current_sid)
    next_index = (current_index + 1) % len(player_sids)
    next_sid = player_sids[next_index]
    lobby_data["active_player"] = {"sid": next_sid, "name": lobby_data["players"][next_sid]}


    emit("player_changed", {"room": room, "active_player": lobby_data["active_player"]}, room=room)

@socketio.on("draw_card")
def draw_card(data):
    room = data.get("room")
    join_room(room)
    lobby_data = lobby.lobbies.get(room)

    if not lobby_data:
        emit("error", {"message": "Lobby not found"})
        return

    if lobby_data["state"] != "playing":
        emit("error", {"message": "Game not started"})
        return

    if len(lobby_data["deck"]) == 0:
        print("Deck is empty, ending game")  # Debug log
        emit("endgame", {"room": room}, room=room)
        return

    lobby_data["turn"] += 1
    card = random.choice(lobby_data["deck"])
    lobby_data["deck"].remove(card)
    
    print(f"Active player: {lobby_data['active_player']['name']} drew card: {card}")  # Debug log

    emit("card_drawn", {"card": card, "turn": lobby_data["turn"]}, room=room)

@socketio.on("reshuffle_deck")
def reshuffle_deck(data):
    room = data.get("room")
    join_room(room)
    lobby_data = lobby.lobbies.get(room)

    if not lobby_data:
        emit("error", {"message": "Lobby not found"})
        return

    if lobby_data["state"] != "playing":
        emit("error", {"message": "Game not started"})
        return

    # Reshuffle the deck
    lobby_data["deck"] = deck

    emit("reshuffled_deck", {"room": room}, room=room)

def update_connexion_info(sid, player_id, room):
    lobby_data = lobby.lobbies.get(room)
    if not lobby_data:
        emit("error", {"message": "Lobby not found"})
        return

    # Update the connections mapping
    lobby_data["connections"][sid] = player_id
    
