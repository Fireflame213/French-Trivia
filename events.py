import json
import random
import base64
import time

TIMESTAMP = int(time.time())

with open("./events.json", "r") as f:
    events = json.load(f)

def random_question() -> int:
    """
    Return a random question from the events dictionary.

    Returns:
        int: A random question.
    """
    return random.choice(list(events.keys()))

def random_event(question: int) -> str:
    """
    Return a random event from the given question.

    Args:
        question (int): The question to choose an event from.

    Returns:
        str: A random event.

    Raises:
        KeyError: If the question is not in the events dictionary.
    """
    return random.choice(events[str(question)])

def str_to_int(string: str) -> int:
    """
    Convert a string to an integer.

    Args:
        string (str): The string to convert.

    Returns:
        int: The integer.
    """
    return int.from_bytes(string.encode(), "big")

def int_to_str(integer: int) -> str:
    """
    Convert an integer to a string.

    Args:
        integer (int): The integer to convert.

    Returns:
        str: The string.
    """
    return integer.to_bytes((integer.bit_length() + 7) // 8, "big").decode()

def hash_event(question: int, event: str) -> str:
    """
    Return a reversible hash of the given question and event.

    Args:
        question (int): The question of the event.
        event (str): The event.

    Returns:
        str: A hash of the question and event.
    """
    # Xor with the TIMESTAMP to make it harder to guess
    xor = str_to_int(event) ^ TIMESTAMP
    string = f"{question}:{xor}"
    return base64.b64encode(string.encode()).decode()

def unhash_event(hash: str) -> tuple:
    """
    Return the question and event from the given hash.

    Args:
        hash (str): The hash to unhash.

    Returns:
        tuple: The question and event.
    """
    string = base64.b64decode(hash).decode()
    question, xor = string.split(":")
    event = int_to_str(int(xor) ^ TIMESTAMP)
    return question, event

if __name__ == "__main__":
    question = random_question()
    event = random_event(question)
    print(f"{question}: {event}")
    hashed = hash_event(question, event)
    print(hashed)
    print(unhash_event(hashed))
