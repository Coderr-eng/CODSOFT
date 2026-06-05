
from __future__ import annotations

import re
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from html import unescape

NEWS_SOURCES = [
    {"name": "BBC News", "url": "https://feeds.bbci.co.uk/news/rss.xml"},
    {"name": "Google News", "url": "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en"},
    {"name": "NPR", "url": "https://feeds.npr.org/1001/rss.xml"},
]

USER_AGENT = "RuleBot/1.0 (Educational Chatbot)"


def _strip_html(text: str) -> str:
    clean = re.sub(r"<[^>]+>", "", text or "")
    return unescape(clean).strip()


def _parse_rss_items(xml_text: str, source_name: str, limit: int = 4) -> list[dict]:
    items: list[dict] = []
    root = ET.fromstring(xml_text)

    for item in root.iter("item"):
        title = _strip_html(item.findtext("title", ""))
        link = (item.findtext("link") or "").strip()
        pub_date = (item.findtext("pubDate") or "").strip()

        if not title:
            continue

        items.append(
            {
                "title": title,
                "link": link,
                "source": source_name,
                "published": pub_date,
            }
        )

        if len(items) >= limit:
            break

    return items


def _fetch_source(url: str, source_name: str, limit: int = 4) -> list[dict]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=12) as response:
        xml_text = response.read().decode("utf-8", errors="replace")
    return _parse_rss_items(xml_text, source_name, limit)


def get_latest_news(max_items: int = 8) -> str:
    """Collect headlines from multiple sources and format a chatbot reply."""
    collected: list[dict] = []
    seen_titles: set[str] = set()

    for source in NEWS_SOURCES:
        try:
            items = _fetch_source(source["url"], source["name"], limit=4)
        except (urllib.error.URLError, urllib.error.HTTPError, ET.ParseError, TimeoutError):
            continue

        for item in items:
            key = item["title"].lower()
            if key in seen_titles:
                continue
            seen_titles.add(key)
            collected.append(item)

            if len(collected) >= max_items:
                break

        if len(collected) >= max_items:
            break

    if not collected:
        return (
            "Sorry, I couldn't fetch live news right now. "
            "Please check your internet connection and try again."
        )

    used_sources = []
    seen_sources: set[str] = set()
    for item in collected[:max_items]:
        if item["source"] not in seen_sources:
            seen_sources.add(item["source"])
            used_sources.append(item["source"])

    lines = ["Latest News & Current Updates:\n"]
    for index, item in enumerate(collected[:max_items], start=1):
        lines.append(f"{index}. {item['title']}")

    lines.append("")
    lines.append(f"Sources: {', '.join(used_sources)}")
    return "\n".join(lines).strip()


if __name__ == "__main__":
    print(get_latest_news())
