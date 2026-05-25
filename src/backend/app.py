import os
from flask import Flask, render_template

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "../frontend/templates"),
    static_folder=os.path.join(BASE_DIR, "../frontend/static"),
    static_url_path="/static"
)

@app.route("/")
def mainPage():
    return render_template("index.html")

@app.route("/game")
def gamePage():
    return render_template("game.html")