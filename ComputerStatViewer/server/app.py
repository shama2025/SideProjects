from flask_cors import CORS
from flask import Flask, Response
import json
import threading
from system import system
from db import fetch_from_table

app = Flask(__name__)
CORS(app=app)


@app.route("/api/system-stats", methods=["GET"])
def fetch_system_information():
    system_info = fetch_from_table()
    return Response(
        response=json.dumps(system_info), status=200, mimetype="application/json"
    )


threading.Timer(10.0, system).start()

if __name__ == "__main__":
    app.run()
