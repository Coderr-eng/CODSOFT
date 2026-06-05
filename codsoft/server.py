"""
Local server for the RuleBot website.
Serves static files and provides /api/news and /api/weather.
"""

import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse
import urllib.request
import urllib.error

from news_fetcher import get_latest_news

PORT = 8080
ROOT = Path(__file__).resolve().parent


class ChatbotHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == "/api/news":
            self._send_news()
            return
        if self.path.startswith("/api/weather"):
            self._send_weather()
            return
        super().do_GET()

    def _send_news(self):
        try:
            text = get_latest_news()
            payload = json.dumps({"ok": True, "text": text}).encode("utf-8")
            status = 200
        except Exception as exc:
            payload = json.dumps(
                {"ok": False, "text": f"Failed to load news: {exc}"}
            ).encode("utf-8")
            status = 500

        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

    def _send_json(self, payload: dict, status: int = 200) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(data)


WEATHER_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


def _fetch_open_meteo(lat: float, lon: float) -> dict:
    # No API key required.
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,weather_code,wind_speed_10m"
        "&timezone=auto"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "RuleBot/1.0"})
    with urllib.request.urlopen(req, timeout=12) as resp:
        body = resp.read().decode("utf-8", errors="replace")
    return json.loads(body)


def _weather_text(lat: float, lon: float) -> str:
    data = _fetch_open_meteo(lat, lon)
    current = data.get("current") or {}

    temp = current.get("temperature_2m")
    wind = current.get("wind_speed_10m")
    code = current.get("weather_code")
    desc = WEATHER_CODE_MAP.get(int(code)) if code is not None else "Unknown"

    # Format safely even if some fields are missing.
    temp_part = f"{temp:g} C" if isinstance(temp, (int, float)) else "—"
    wind_part = f"{wind:g} km/h" if isinstance(wind, (int, float)) else "—"
    return (
        f"Weather now:\n"
        f"Temperature: {temp_part}\n"
        f"Condition: {desc}\n"
        f"Wind: {wind_part}"
    )


def _send_weather(handler: ChatbotHandler) -> None:
    try:
        query = urlparse(handler.path).query
        params = parse_qs(query)
        lat = float(params.get("lat", [""])[0])
        lon = float(params.get("lon", [""])[0])
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            raise ValueError("Invalid lat/lon")

        text = _weather_text(lat, lon)
        handler._send_json({"ok": True, "text": text}, status=200)
    except Exception as exc:
        handler._send_json(
            {"ok": False, "text": f"Failed to load weather: {exc}"},
            status=500,
        )


# Attach as method on the handler to keep the diff small.
def _handler_send_weather(self: ChatbotHandler) -> None:
    _send_weather(self)


setattr(ChatbotHandler, "_send_weather", _handler_send_weather)


def main():
    server = HTTPServer(("localhost", PORT), ChatbotHandler)
    print("=" * 50)
    print("  RuleBot Web Server")
    print(f"  Open: http://localhost:{PORT}")
    print(f"  News API: http://localhost:{PORT}/api/news")
    print(f"  Weather API: http://localhost:{PORT}/api/weather?lat=..&lon=..")
    print("  Press Ctrl+C to stop")
    print("=" * 50)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")


if __name__ == "__main__":
    main()
