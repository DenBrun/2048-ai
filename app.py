from flask import Flask, jsonify, request, render_template
from random import randint
app = Flask(__name__)


@app.route('/')
def get_main_page():
    return render_template("index.html")


@app.route('/gamestate', methods=['GET'])
def get_game_state():
    # Retrieve the current game state
    # Implement this function to read the game state from a file
    # game_state = {"tiles": [1, 2, 3, 1, 3]}
    game_state = {"tiles": [[randint(0, 3), randint(0, 3)], [
        randint(0, 3), randint(0, 3)]]}

    # Return the game state as JSON
    return jsonify(game_state)
