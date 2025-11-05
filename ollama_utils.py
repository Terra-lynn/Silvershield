import subprocess

def call_ollama(prompt, model="mistral"):
    """Calls Ollama model locally and returns plain text."""
    try:
        result = subprocess.run(
            ["ollama", "run", model],
            input = prompt.encode("utf-8"),
            capture_output = True,
            check = True,
        )
        return result.stdout.decode("utf-8").strip()
    except subprocess.CalledProcessError as e:
        return f"Ollama error: {e.stderr.decode("utf-8")}"
