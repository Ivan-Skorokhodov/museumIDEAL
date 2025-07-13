from flask import Flask, send_from_directory
import os
import sys

# Перенаправление логов
sys.stderr = sys.stdout

# Определение рабочей директории
if getattr(sys, 'frozen', False):
    # Если .exe (или бинарь на Linux)
    base_dir = sys._MEIPASS  # временная папка с распакованным содержимым
else:
    base_dir = os.path.dirname(os.path.abspath(__file__))

print(f"[INFO] Serving static files from: {base_dir}")

app = Flask(__name__, static_folder=base_dir)


@app.route('/')
def index():
    return send_from_directory(base_dir, 'index.html')


@app.route('/museum/<path:filepath>')
def handle_museum_prefix(filepath):
    return serve_static(filepath)


@app.route('/<path:filepath>')
def serve_static(filepath):
    return send_from_directory(base_dir, filepath)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 9000))
    app.run(host='127.0.0.1', port=port, debug=True)
