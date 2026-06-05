# RULE BASED CHATBOT
REPOSITORY CONTAINING CODE FOR THE TASKS

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
## How It Works

1. **Pattern matching** — User input is checked against ordered regex rules in `RULES`.
2. **Intent detection** — The first matching rule assigns an intent (e.g. `greeting`, `math`).
3. **If-else responses** — `get_response()` branches on intent to pick the right reply.
4. **Conversation loop** — The `chat()` function keeps the dialogue going until the user says goodbye.

## Project Structure

```
codsoft/
├── index.html      # Chatbot website UI
├── style.css       # Website styles
├── chatbot.js      # Rule-based logic (browser)
├── news_fetcher.py # Fetches headlines from RSS feeds
├── server.py       # Local web server + /api/news
└── README.md       # This file
```
