// ============================================================
// DOM Elements
// ============================================================
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const messagesDiv = document.getElementById("messages");
const sendBtn = document.getElementById("send-btn");

// ============================================================
// Message Management
// ============================================================

function appendMessage(text, isUser = false, className = "") {
    const msg = document.createElement("div");
    msg.classList.add("message", isUser ? "user" : "ai");
    if (className) msg.classList.add(className);
    msg.textContent = text;
    messagesDiv.appendChild(msg);
    scrollToBottom();
    return msg;
}

function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ============================================================
// Stream Handler for Agentic "Showing Thinking"
// ============================================================

async function sendMessage(text) {
    sendBtn.disabled = true;
    input.disabled = true;

    let thinkingBox = null;
    let answerBox = null;
    let hasReceivedToken = false;

    try {
        const res = await fetch("/api/orchestrator", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        if (!res.ok) {
            appendMessage(
                `❌ Error: ${res.status} ${res.statusText}`,
                false,
                "error"
            );
            return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop(); // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.trim() === "") continue;

                try {
                    const event = JSON.parse(line);

                    console.log("Event received:", event); // Debug log

                    // ========== Event Type Handling ==========
                    if (event.type === "thought") {
                        // Create or update thinking box
                        if (!thinkingBox && !hasReceivedToken) {
                            thinkingBox = document.createElement("div");
                            thinkingBox.classList.add("message", "ai", "thinking");
                            messagesDiv.appendChild(thinkingBox);
                        }
                        if (thinkingBox && !hasReceivedToken) {
                            thinkingBox.textContent = event.content;
                        }
                    }
                    else if (event.type === "token") {
                        // First token = remove thinking, create answer box
                        if (!hasReceivedToken) {
                            hasReceivedToken = true;
                            if (thinkingBox && thinkingBox.parentNode) {
                                thinkingBox.remove();
                                thinkingBox = null;
                            }
                        }

                        // Create answer box if needed
                        if (!answerBox) {
                            answerBox = document.createElement("div");
                            answerBox.classList.add("message", "ai");
                            messagesDiv.appendChild(answerBox);
                        }

                        // Append token
                        answerBox.textContent += event.content;
                    }
                    else if (event.type === "complete") {
                        // Done
                        console.log("Stream complete");
                    }
                    else if (event.type === "error") {
                        appendMessage(`❌ ${event.content}`, false, "error");
                    }

                    // Keep scrolled to bottom
                    scrollToBottom();

                } catch (e) {
                    console.warn("Failed to parse JSON line:", line, e);
                }
            }
        }

    } catch (err) {
        console.error("Network error:", err);
        appendMessage(
            "❌ Network error occurred. Please try again.",
            false,
            "error"
        );
    } finally {
        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
    }
}

// ============================================================
// Event Listeners
// ============================================================

// Handle form submission
form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // Show user message
    appendMessage(text, true);
    input.value = "";

    // Send to agent and stream response
    sendMessage(text);
});

// Enter to send, Shift+Enter for newline
input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event("submit"));
    }
});

// Focus/blur styling
input.addEventListener("blur", () => {
    input.classList.remove("focused");
});

input.addEventListener("focus", () => {
    input.classList.add("focused");
});
