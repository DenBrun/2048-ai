from flask import Flask, jsonify, request, render_template
from random import randint
import json
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


@app.route('/get-user', methods=['GET'])
def get_user_data():
    # Retrieve the current game state
    # Implement this function to read the game state from a file
    user_id = request.args.get('id')
    # data = {}
    with open('data.txt', 'r') as f:
        data = json.load(f)
    # Return the game state as JSON
    try:
        return jsonify(data[user_id])
    except KeyError:
        return {'error': 'Can\'t find the key'}


@app.route('/save-user', methods=['POST'])
def save_user_data():
    new_data = request.get_json()
    print(new_data['id'])
    print(new_data['data'])
    try:
        with open('data.txt', 'r') as f:
            all_data = json.load(f)
            all_data[new_data['id']] = new_data['data']
        with open('data.txt', 'w') as f:
            json.dump(all_data, f, indent=4)
    except KeyError:
        return jsonify({'error': 'Invalid JSON'}), 400
    return 'Success'
