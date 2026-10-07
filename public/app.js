const messages = document.getElementById("messages");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const clearBtn = document.getElementById("clearBtn");
const orbStatus = document.getElementById("orbStatus");
const systemStatus = document.getElementById("systemStatus");
const clock = document.getElementById("clock");
const footerYear = document.getElementById("footerYear");

const conversation = [];

footerYear.textContent = new Date().getFullYear();

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 1000);

function setStatus(text, online = true) {
  orbStatus.textContent = text;
  systemStatus.textContent = online ? "ONLINE" : "OFFLINE";
}

function addMessage(who, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${who === "user" ? "user-message" : "nova-message"}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = who === "user" ? "YOU" : "N";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.innerHTML = who === "user"
    ? "YOU <span>SENT</span>"
    : "NOVA <span>AI</span>";

  const p = document.createElement("p");
  p.textContent = text;

  bubble.append(meta, p);
  wrapper.append(avatar, bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

function setLoading(loading) {
  sendBtn.disabled = loading;
  input.disabled = loading;
  sendBtn.querySelector("span:first-child").textContent = loading ? "WAIT" : "SEND";
  setStatus(loading ? "THINKING" : "READY");
}

async function askNova(message) {
  const clean = message.trim();
  if (!clean) return;

  addMessage("user", clean);
  input.value = "";
  setLoading(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: clean,
        history: conversation.slice(-12)
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);

    conversation.push({ role: "user", content: clean });
    conversation.push({ role: "assistant", content: data.reply });

    addMessage("nova", data.reply);
    speak(data.reply);
  } catch (error) {
    addMessage("nova", error.message || "NOVA could not connect to the server.");
    setStatus("ERROR", false);
  } finally {
    setLoading(false);
    input.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  askNova(input.value);
});

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    input.focus();
  });
});

clearBtn.addEventListener("click", () => {
  conversation.length = 0;
  messages.innerHTML = "";
  addMessage("nova", "Conversation cleared. I'm ready whenever you are.");
  setStatus("READY");
});

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.02;
  utterance.pitch = 0.95;
  utterance.onstart = () => setStatus("SPEAKING");
  utterance.onend = () => setStatus("READY");
  window.speechSynthesis.speak(utterance);
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = navigator.language || "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  micBtn.addEventListener("click", () => {
    try {
      recognition.start();
    } catch (_) {}
  });

  recognition.onstart = () => {
    micBtn.classList.add("listening");
    setStatus("LISTENING");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    askNova(transcript);
  };

  recognition.onerror = () => {
    setStatus("READY");
  };

  recognition.onend = () => {
    micBtn.classList.remove("listening");
    if (orbStatus.textContent === "LISTENING") setStatus("READY");
  };
} else {
  micBtn.disabled = true;
  micBtn.title = "Speech recognition is not supported by this browser.";
}
