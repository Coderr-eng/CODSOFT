# Rule-Based Chatbot

A simple chatbot that responds to user inputs using **predefined rules**, **if-else statements**, and **regex pattern matching**. No machine learning — just classic NLP fundamentals.

## Features

| Intent | Example inputs |
|--------|----------------|
| Greeting | `hi`, `hello`, `good morning` |
| Farewell | `bye`, `quit`, `see you` |
| Help | `help`, `what can you do` |
| Time / Date | `what time is it`, `what's the date` |
| Math | `5 + 3`, `what is 10 * 2` |
| Jokes | `tell me a joke` |
| Weather | `how's the weather` (live using your location) |
| News | `latest news`, `current updates`, `headlines` |
| Identity | `what's your name`, `who created you` |

## Requirements

- Python 3.8+

No external packages required — uses only the standard library.

## How to Run

### Web version (recommended for news + weather)

Run the built-in server (serves the site + live news + live weather API):

```bash
python server.py
```

Then open **http://localhost:8080** in your browser.

You can also open `index.html` directly, but live news and live weather require `server.py`.

### Python CLI version

```bash
python chatbot.py
```

## How It Works

1. **Pattern matching** — User input is checked against ordered regex rules in `RULES`.
2. **Intent detection** — The first matching rule assigns an intent (e.g. `greeting`, `math`).
3. **If-else responses** — `get_response()` branches on intent to pick the right reply.
4. **Conversation loop** — The `chat()` function keeps the dialogue going until the user says goodbye.

## Example Conversation

```
You: hello
Bot: Hi there! What can I do for you?

You: what time is it
Bot: The current time is 02:30 PM.

You: 12 + 8
Bot: 12 + 8 = 20

You: tell me a joke
Bot: Why do programmers prefer dark mode? Because light attracts bugs!

You: bye
Bot: Goodbye! Have a great day!
```

## Project Structure

```
codsoft/
├── index.html      # Chatbot website UI
├── style.css       # Website styles
├── chatbot.js      # Rule-based logic (browser)
├── chatbot.py      # Rule-based logic (Python CLI)
├── news_fetcher.py # Fetches headlines from RSS feeds
├── server.py       # Local web server + /api/news
└── README.md       # This file
```
