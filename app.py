from flask import Flask, jsonify, request, render_template
import json
import os
app = Flask(__name__)
# flask --app app run --debug


def check_file():
    if os.path.exists('data.txt'):
        try:
            with open('data.txt') as file:
                content = file.read()
                json.loads(content)

        except ValueError:
            with open('data.txt', 'w') as file:
                file.write('{}')
    else:
        with open('data.txt', 'w') as file:
            file.write('{}')


check_file()


@app.route('/')
def get_main_page():
    return render_template("index.html")


@app.route('/get-user', methods=['GET'])
def get_user_data():
    # Retrieve the current game state
    user_id = request.args.get('id')
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
    try:
        with open('data.txt', 'r') as f:
            all_data = json.load(f)
            all_data[new_data['id']] = new_data['data']
        with open('data.txt', 'w') as f:
            json.dump(all_data, f, indent=4)
    except KeyError:
        return jsonify({'error': 'Invalid JSON'}), 400
    return 'Success'
