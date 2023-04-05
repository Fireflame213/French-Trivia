import events
from flask import Flask, request
from flask_cors import CORS, cross_origin

app = Flask(__name__, static_url_path="/static", static_folder="static")
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/get_event", methods=["GET"])
@cross_origin()
def get_event():
    """
    Get a random hashed event. This is the first endpoint that the frontend
    will call.
    """
    question = events.random_question()
    event = events.random_event(question)
    hashed = events.hash_event(question, event)
    return {"question": question, "hash": hashed, "length": len(event)}

@app.route("/check", methods=["POST"])
@cross_origin()
def check():
    """
    Check if the given event is correct. This is the endpoint that the frontend
    will call when the user submits a guess.
    """
    data = request.get_json()
    hashed = str(data["hash"])
    event = str(data["event"]).lower()
    question, correct_event = events.unhash_event(hashed)
    correct_indexes = []  # The indexes of the correct characters.
    wrong_places = []  # The indexes and char of characters in the wrong place.
    if len(event) != len(correct_event):  # Check length first to avoid index errors.
        return {"correct": False, "correct_indexes": correct_indexes, "wrong_places": wrong_places}
    elif event == correct_event:
        correct_indexes = list(range(len(event)))  # All characters are correct.
        return {"correct": True, "correct_indexes": correct_indexes, "wrong_places": wrong_places}
    else:
        for i, letter in enumerate(event):
            if letter == correct_event[i]:
                # The letter is in the correct place.
                correct_indexes.append(i)
            else:
                if letter in correct_event:
                    # The letter exists in the correct event, but is in the wrong place.
                    wrong_places.append((i, letter))
        return {"correct": False, "correct_indexes": correct_indexes, "wrong_places": wrong_places}

if __name__ == "__main__":
    app.run(threaded=True)
