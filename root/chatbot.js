
const RESPONSES = {
  greeting: [
    "Hello! How can I help you today?",
    "Hi there! What can I do for you?",
    "Hey! Nice to meet you. Ask me anything!",
  ],
  farewell: [
    "Goodbye! Have a great day!",
    "See you later! Take care!",
    "Bye! It was nice chatting with you.",
  ],
  thanks: [
    "You're welcome!",
    "Happy to help!",
    "Anytime! Let me know if you need anything else.",
  ],
  help: [
    "I can answer questions about:\n" +
    "  • Greetings (hi, hello)\n" +
    "  • Time and date\n" +
    "  • Weather (live using your location)\n" +
    "  • Jokes\n" +
    "  • Basic math\n" +
    "  • Latest news & current updates\n" +
    "  • My name and creator\n" +
    "Type 'bye' when you're done chatting.",
  ],
  name: [
    "I'm RuleBot, a simple rule-based chatbot!",
    "My name is RuleBot. I respond using predefined rules.",
  ],
  creator: [
    "I was built as a learning project to demonstrate rule-based NLP.",
    "I'm a demo chatbot created to show how if-else and pattern matching work.",
  ],
  joke: [
    "Why do programmers prefer dark mode? Because light attracts bugs!",
    "Why did the developer go broke? Because he used up all his cache!",
    "How many programmers does it take to change a light bulb? None — it's a hardware problem.",
  ],
  weather: [
    "I don't have real weather data, but it looks like a great day to code!",
    "Demo mode: Sunny with a chance of learning new things!",
    "I can't check live weather, but I hope it's nice where you are!",
  ],
  fallback: [
    "I'm not sure I understand. Try asking about time, jokes, or type 'help'.",
    "Hmm, I don't have a rule for that. Type 'help' to see what I can do.",
    "Could you rephrase that? Or type 'help' for a list of topics.",
  ],
  math_help: [
    "I can do basic math! Try:\n  • Addition\n  • Subtraction\n  • Multiplication\n  • Division",
  ],
};

const WORD_TO_OP = {
  plus: "+",
  minus: "-",
  subtract: "-",
  times: "*",
  multiply: "*",
  "multiplied by": "*",
  divide: "/",
  "divided by": "/",
};

const MATH_PATTERNS = [
  /^(?:(?:what\s+is|calculate|solve|compute)\s+)?(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)\s*\??$/i,
  /^(?:(?:what\s+is|calculate|solve|compute)\s+)?(\d+(?:\.\d+)?)\s*(plus|minus|subtract|times|multiply|multiplied\s+by|divide|divided\s+by)\s*(\d+(?:\.\d+)?)\s*\??$/i,
];

const RULES = [
  [/\b(hi|hello|hey|howdy|greetings|good\s+(morning|afternoon|evening))\b/i, "greeting"],
  [/\b(bye|goodbye|see\s+you|exit|quit|later)\b/i, "farewell"],
  [/\b(thanks|thank\s+you|thx|appreciate)\b/i, "thanks"],
  [/\b(help|what\s+can\s+you\s+do|commands|options)\b/i, "help"],
  [/\b(your\s+name|who\s+are\s+you|what\s+are\s+you)\b/i, "name"],
  [/\b(who\s+(made|created|built)\s+you|your\s+creator)\b/i, "creator"],
  [/\b(joke|funny|make\s+me\s+laugh|tell\s+me\s+a\s+joke)\b/i, "joke"],
  [/\b(weather|temperature|forecast|rain|sunny)\b/i, "weather"],
  [/\b(time|what\s+time|clock)\b/i, "time"],
  [/\b(date|today|what\s+day|day\s+is\s+it)\b/i, "date"],
  [/^\s*math\s*\??$/i, "math_help"],
  [/\b(news|headlines|current\s+affairs|latest\s+news|recent\s+news|current\s+updates?|what'?s\s+happening|top\s+stories|breaking\s+news)\b/i, "news"],
];

const NEWS_SOURCES = [
  { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml" },
  { name: "Google News", url: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en" },
  { name: "NPR", url: "https://feeds.npr.org/1001/rss.xml" },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTimeResponse() {
  const now = new Date();
  return `The current time is ${now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}.`;
}

function getDateResponse() {
  const now = new Date();
  return `Today is ${now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}.`;
}

function formatNum(n) {
  return Number.isInteger(n) ? String(n) : String(n);
}

function normalizeWordOp(word) {
  return WORD_TO_OP[word.toLowerCase().replace(/\s+/g, " ").trim()] || null;
}

function parseMath(userInput) {
  const text = userInput.trim().toLowerCase();

  for (const pattern of MATH_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;

    const num1 = parseFloat(match[1]);
    let operator = match[2];
    const num2 = parseFloat(match[3]);

    if (operator.length > 1) {
      operator = normalizeWordOp(operator);
      if (!operator) continue;
    }

    return { num1, operator, num2 };
  }

  return null;
}

function getMathResponse(parsed) {
  const { num1, operator, num2 } = parsed;
  let result;

  if (operator === "+") result = num1 + num2;
  else if (operator === "-") result = num1 - num2;
  else if (operator === "*") result = num1 * num2;
  else if (operator === "/") {
    if (num2 === 0) return "I can't divide by zero!";
    result = num1 / num2;
  } else {
    return pick(RESPONSES.fallback);
  }

  return `${formatNum(num1)} ${operator} ${formatNum(num2)} = ${formatNum(result)}`;
}

function matchIntent(userInput) {
  const text = userInput.trim().toLowerCase();

  const math = parseMath(text);
  if (math) return { intent: "math", match: math };

  for (const [pattern, intent] of RULES) {
    const match = text.match(pattern);
    if (match) return { intent, match };
  }

  return { intent: "fallback", match: null };
}

function stripHtml(text) {
  const el = document.createElement("div");
  el.innerHTML = text || "";
  return el.textContent.trim();
}

function parseRssItems(xmlText, sourceName, limit = 4) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const items = [...doc.querySelectorAll("item")].slice(0, limit);

  return items.map((item) => ({
    title: stripHtml(item.querySelector("title")?.textContent || ""),
    link: (item.querySelector("link")?.textContent || "").trim(),
    source: sourceName,
  })).filter((item) => item.title);
}

async function fetchRssFeed(source) {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(source.url)}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error(`Failed to load ${source.name}`);
  const xmlText = await response.text();
  return parseRssItems(xmlText, source.name);
}

async function fetchNewsFromSources() {
  const collected = [];
  const seen = new Set();

  for (const source of NEWS_SOURCES) {
    try {
      const items = await fetchRssFeed(source);
      for (const item of items) {
        const key = item.title.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        collected.push(item);
        if (collected.length >= 8) break;
      }
    } catch {
      continue;
    }
    if (collected.length >= 8) break;
  }

  if (!collected.length) {
    throw new Error("No headlines available");
  }

  const usedSources = [...new Set(collected.map((item) => item.source))];

  const lines = ["Latest News & Current Updates:\n"];
  collected.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.title}`);
  });
  lines.push("");
  lines.push(`Sources: ${usedSources.join(", ")}`);
  return lines.join("\n").trim();
}

async function fetchNewsResponse() {
  try {
    const apiResponse = await fetch("/api/news");
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      if (data.ok && data.text) return data.text;
    }
  } catch {
    // Fall back to direct RSS fetch when not using server.py
  }

  try {
    return await fetchNewsFromSources();
  } catch {
    return (
      "Sorry, I couldn't fetch live news right now.\n" +
      "Run `python server.py` and open http://localhost:8080 for best results."
    );
  }
}

const WEATHER_CODE_MAP = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
};

function getCurrentPositionAsync() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        source: "GPS",
        place: "",
      }),
      (err) => reject(err),
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  });
}

async function getLocationByIP() {
  const providers = [
    async () => {
      const response = await fetch("https://ipwho.is/");
      if (!response.ok) throw new Error("ipwho.is failed");
      const data = await response.json();
      if (!data.success) throw new Error("ipwho.is unavailable");
      return {
        lat: data.latitude,
        lon: data.longitude,
        place: [data.city, data.region].filter(Boolean).join(", "),
      };
    },
    async () => {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) throw new Error("ipapi.co failed");
      const data = await response.json();
      return {
        lat: data.latitude,
        lon: data.longitude,
        place: [data.city, data.region].filter(Boolean).join(", "),
      };
    },
  ];

  let lastError;
  for (const provider of providers) {
    try {
      const result = await provider();
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
      return { lat, lon, source: "IP", place: result.place || "" };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("IP location failed");
}

async function getLocation() {
  try {
    return await getCurrentPositionAsync();
  } catch {
    return await getLocationByIP();
  }
}

function formatWeatherText(data, place, source) {
  const current = data.current || {};
  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;
  const code = current.weather_code;
  const desc = WEATHER_CODE_MAP[code] || "Unknown";

  const tempPart = typeof temp === "number" ? `${temp} C` : "N/A";
  const windPart = typeof wind === "number" ? `${wind} km/h` : "N/A";
  const locationPart = place ? ` in ${place}` : "";

  return (
    `Weather now${locationPart}:\n` +
    `Temperature: ${tempPart}\n` +
    `Condition: ${desc}\n` +
    `Wind: ${windPart}\n` +
    `Source: Open-Meteo (${source} location)`
  );
}

async function fetchWeatherFromOpenMeteo(lat, lon, place, source) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto";

  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather service unavailable");

  const data = await response.json();
  return formatWeatherText(data, place, source);
}

async function fetchWeatherResponse() {
  try {
    const { lat, lon, source, place } = await getLocation();

    try {
      const apiResponse = await fetch(
        `/api/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
      );
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        if (data.ok && data.text) {
          const locationPart = place ? ` in ${place}` : "";
          return `${data.text}${locationPart ? `\nLocation: ${place}` : ""}\nSource: Open-Meteo (${source} location)`;
        }
      }
    } catch {
      // Server not running — use Open-Meteo directly
    }

    return await fetchWeatherFromOpenMeteo(lat, lon, place, source);
  } catch (err) {
    if (err && err.code === 1) {
      return (
        "Location access was blocked.\n" +
        "Allow location in your browser, or run `python server.py` and open http://localhost:8080"
      );
    }
    return (
      "Couldn't fetch live weather right now.\n" +
      "Check your internet connection and try again."
    );
  }
}

async function getResponse(userInput) {
  if (!userInput.trim()) {
    return { text: "Please type something!", isFarewell: false };
  }

  const { intent, match } = matchIntent(userInput);
  let text;

  if (intent === "time") {
    text = getTimeResponse();
  } else if (intent === "date") {
    text = getDateResponse();
  } else if (intent === "math") {
    text = getMathResponse(match);
  } else if (intent === "weather") {
    text = await fetchWeatherResponse();
  } else if (intent === "news") {
    text = await fetchNewsResponse();
  } else if (intent === "farewell") {
    return { text: pick(RESPONSES.farewell), isFarewell: true };
  } else if (RESPONSES[intent]) {
    text = pick(RESPONSES[intent]);
  } else {
    text = pick(RESPONSES.fallback);
  }

  return { text, isFarewell: false };
}

/* ---- UI ---- */

const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const quickReplies = document.getElementById("quick-replies");

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
  chatWindow.appendChild(div);
  scrollToBottom();
}

function escapeHtml(text) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "message bot typing";
  div.id = "typing-indicator";
  div.innerHTML = `<div class="bubble"><span></span><span></span><span></span></div>`;
  chatWindow.appendChild(div);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

async function handleMessage(text) {
  if (!text.trim()) return;

  addMessage(text, "user");
  userInput.value = "";
  sendBtn.disabled = true;

  showTyping();

  const { intent } = matchIntent(text);
  const delay = intent === "news" ? 800 : intent === "weather" ? 900 : 500 + Math.random() * 400;

  setTimeout(async () => {
    try {
      const { text: reply, isFarewell } = await getResponse(text);
      hideTyping();
      addMessage(reply, "bot");

      if (isFarewell) {
        userInput.placeholder = "Chat ended — refresh page to restart";
        userInput.disabled = true;
        sendBtn.disabled = true;
        quickReplies.style.display = "none";
      } else {
        sendBtn.disabled = false;
        userInput.focus();
      }
    } catch {
      hideTyping();
      addMessage("Something went wrong. Please try again.", "bot");
      sendBtn.disabled = false;
      userInput.focus();
    }
  }, delay);
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleMessage(userInput.value);
});

quickReplies.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-msg]");
  if (!btn || userInput.disabled) return;
  handleMessage(btn.dataset.msg);
});

userInput.focus();
