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

def run_sub_process():
    system()
    threading.Timer(15.0, run_sub_process).start()

threading.Timer(10.0, run_sub_process).start()

if __name__ == "__main__":
    app.run()
