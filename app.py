from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Файл для хранения балансов
BALANCES_FILE = "balances.json"

def load_balances():
    """Загружает балансы из файла."""
    try:
        with open(BALANCES_FILE, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {}

@app.route('/get_balance', methods=['GET'])
def get_balance():
    """Возвращает баланс пользователя по username."""
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Username is required"}), 400

    balances = load_balances()
    balance = balances.get(username, 0)
    return jsonify({"username": username, "balance": balance})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)