from flask import Flask, send_from_directory, redirect
import os

app = Flask(__name__, static_folder='.')


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/museum/<path:filepath>')
def handle_museum_prefix(filepath):
    return serve_static(filepath)


@app.route('/<path:filepath>')
def serve_static(filepath):
    return send_from_directory('.', filepath)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 9000))
    app.run(host='0.0.0.0', port=port, debug=True)
