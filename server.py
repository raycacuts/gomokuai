from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle

from policy_value_net_numpy import PolicyValueNetNumpy
from mcts_alphaZero import MCTSPlayer
from game import Board, Game

# --- Configuration ---
BOARD_WIDTH = 8
BOARD_HEIGHT = 8
N_IN_ROW = 5
MODEL_PATH = "./best_policy_8_8_5.model"

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)

# --- Game Setup ---
board = Board(width=BOARD_WIDTH, height=BOARD_HEIGHT, n_in_row=N_IN_ROW)
game = Game(board)

# --- Load PolicyValueNetNumpy Model ---
try:
    policy_param = pickle.load(open(MODEL_PATH, 'rb'))
except:
    policy_param = pickle.load(open(MODEL_PATH, 'rb'), encoding='bytes')  # For Python 3 compatibility

policy_value_net = PolicyValueNetNumpy(BOARD_WIDTH, BOARD_HEIGHT, policy_param)
mcts_player = MCTSPlayer(policy_value_net.policy_value_fn, c_puct=5, n_playout=400)

# --- API Route ---
@app.route("/gomoku-ai-move", methods=["POST"])
def gomoku_ai_move():
    data = request.get_json()
    board_state = data["board"]          # 2D list: 0 = empty, 1 = black, 2 = white
    current_player = data.get("player", 1)

    # Reset board and replay the current state
    board.init_board(start_player=current_player)
    for i in range(BOARD_HEIGHT):
        for j in range(BOARD_WIDTH):
            p = board_state[i][j]
            if p != 0:
                move = i * BOARD_WIDTH + j
                board.states[move] = p
    board.availables = list(set(range(BOARD_WIDTH * BOARD_HEIGHT)) - set(board.states.keys()))
    board.current_player = current_player

    move = mcts_player.get_action(board, temp=1e-3)
    x, y = divmod(move, BOARD_WIDTH)
    return jsonify({"move": [int(x), int(y)]})

# --- Run Server ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
