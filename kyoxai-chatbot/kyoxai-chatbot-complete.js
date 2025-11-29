// kyoxai-chatbot.js - Complete single file version
class KyoxAIChatbot {
  static config = {
    BRAND: {
      NAME: 'kyox.ai',
      WEBSITE: 'https://kyox.ai/',
      LOGO: 'https://kyox.ai/kyoxai-chatbot/kyoxai_logo.jpg',
      PRIMARY_COLOR: '#000000',
      SECONDARY_COLOR: '#F0F4F8'
    },
    USER_MESSAGE_BG: '#000000',
    USER_ICON: 'https://kyox.ai/kyoxai-chatbot/kyoxai_logo.jpg',
    FREQUENT_QUESTIONS: [
      "What kyox.ai Does",
      "Founder Information",
      "Differentiation from Competitors",
      "Mission & Unique Value Proposition (UVP)",
      "How kyox.ai Can Help (FAQs with Answers)"
    ],
    behavior: {
      maxQuestions: 20,
      maxContentLength: 1000,
      limitMessages: {
        lengthExceeded: "Message is too long (max 1000 characters). Please ask a shorter question.",
        questionLimit: "You've reached the daily limit of 20 questions. Please try again tomorrow."
      }
    }
  };

  constructor(config = {}) {
    this.initializeConfig(config);
    
    this.loadDependencies().then(() => {
      this.loadStyles();
      this.initializeApp();
    });
  }

  initializeConfig(userConfig) {
    if (userConfig.BRAND) {
      KyoxAIChatbot.config.BRAND = { 
        ...KyoxAIChatbot.config.BRAND, 
        ...userConfig.BRAND 
      };
    }
    
    this.initializeCopyTexts();
    this.apiEndpoint = userConfig.apiUrl || window.CHATBOT_API || '/chat';
  }

  initializeCopyTexts() {
    const brand = KyoxAIChatbot.config.BRAND;
    KyoxAIChatbot.config.COPY = {
      header: `${brand.NAME} AI Agent`,
      systemMessage: `Please note: You can ask up to <strong>20 questions</strong> about ${brand.NAME}`,
      initialMessage: `Hi! What can I help you with ${brand.NAME}?`,
      inputPlaceholder: "Ask your question...",
      footerHTML: `Powered by <a href="${brand.WEBSITE}" target="_blank">${brand.NAME}</a> | AI can make mistakes.`
    };
  }

  async loadDependencies() {
    return new Promise((resolve) => {
      if (window.marked && window.DOMPurify) {
        return resolve();
      }

      let loadedCount = 0;
      const checkLoaded = () => ++loadedCount === 2 && resolve();

      const markedScript = document.createElement('script');
      markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
      markedScript.onload = checkLoaded;
      document.head.appendChild(markedScript);

      const purifyScript = document.createElement('script');
      purifyScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.5/purify.min.js';
      purifyScript.onload = checkLoaded;
      document.head.appendChild(purifyScript);
    });
  }

  loadStyles() {
    if (document.getElementById('kyoxai-chatbot-styles')) return;

    const style = document.createElement('style');
    style.id = 'kyoxai-chatbot-styles';
    style.textContent = this.getCSS();
    document.head.appendChild(style);

    this.loadFontAwesome();
  }

  getCSS() {
    return `
      :root {
        --primary-color: ${KyoxAIChatbot.config.BRAND.PRIMARY_COLOR};
        --secondary-color: ${KyoxAIChatbot.config.BRAND.SECONDARY_COLOR};
        --user-message-bg-color: ${KyoxAIChatbot.config.USER_MESSAGE_BG};
      }

      #kyoxai-chatbot-container {
        position: fixed;
        bottom: 90px;
        right: 25px;
        width: 420px;
        height: 650px;
        background: white;
        border-radius: 15px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 1000;
      }

      #kyoxai-chatbot-header {
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 2px solid var(--secondary-color);
      }

      #kyoxai-chatbot-header h4 {
        margin: 0;
        font-size: 1.1em;
        color: var(--primary-color);
      }

      #kyoxai-chatbot-messages {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        background: var(--secondary-color);
      }

      #kyoxai-chatbot-frequent-questions {
        padding: 10px;
        background: #fff;
        border-top: 1px solid var(--secondary-color);
        border-bottom: 1px solid var(--secondary-color);
      }

      #kyoxai-chatbot-frequent-questions h6 {
        margin-top: 1px;
        margin-bottom: 6px;
        font-size: 0.9em;
        font-weight: bold;
      }

      #frequentQuestions {
        display: flex;
        flex-wrap: wrap;
      }

      .frequent-question-btn {
        margin: 4px;
        white-space: normal;
        text-align: left;
        font-size: 0.85em;
        border: 1px solid var(--primary-color);
        background: #fff;
        color: var(--primary-color);
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
      }

      .frequent-question-btn:hover {
        background: var(--primary-color);
        color: #fff;
      }

      #kyoxai-chatbot-input-area {
        display: flex;
        padding: 10px;
        border-top: 1px solid var(--secondary-color);
        background: #fff;
      }

      #kyoxai-chatbot-input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      #kyoxai-chatbot-send {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 8px 12px;
        margin-left: 8px;
        border-radius: 4px;
        cursor: pointer;
      }

      #kyoxai-chatbot-footer {
        text-align: center;
        font-size: 0.8em;
        color: #6c757d;
        padding: 8px;
        border-top: 1px solid var(--secondary-color);
      }

      #kyoxai-chatbot-footer a {
        color: var(--primary-color);
        text-decoration: none;
      }

      #kyoxai-chatbot-toggle {
        position: fixed;
        bottom: 25px;
        right: 25px;
        width: 56px;
        height: 56px;
        background: #000;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        transition: transform 0.3s ease;
        overflow: hidden;
      }

      #kyoxai-chatbot-toggle img, #kyoxai-chatbot-toggle i {
        position: absolute;
        transition: opacity 0.3s ease;
      }

      #kyoxai-chatbot-toggle img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        opacity: 1;
      }

      #kyoxai-chatbot-toggle i {
        font-size: 1.5em;
        color: white;
        opacity: 0;
      }

      .system-message {
        background: #fff3cd;
        color: #856404;
        border-radius: 10px;
        padding: 10px;
        margin: 15px 0;
        font-size: 0.9em;
        animation: fadeIn 0.3s ease;
      }

      .message-container {
        display: flex;
        gap: 12px;
        margin: 10px 0;
        max-width: 90%;
      }

      .bot-message-container {
        margin-right: auto;
      }

      .user-message-container {
        margin-left: auto;
        flex-direction: row-reverse;
      }

      .message-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .message-bubble {
        padding: 8px 12px;
        border-radius: 20px;
        max-width: 80%;
      }

      .bot-message-bubble {
        background: white;
        border: 1px solid #dee2e6;
        font-size: 0.9em;
      }

      .user-message-bubble {
        background: var(--user-message-bg-color);
        color: white;
        font-size: 0.9em;
      }

      .loading-dots {
        display: inline-block;
        vertical-align: middle;
      }

      .loading-dots span {
        display: inline-block;
        width: 6px;
        height: 6px;
        margin: 0 2px;
        background-color: #666;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-8px); }
      }

      .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
      .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

      .bot-message-bubble h3 {
        color: var(--primary-color);
        font-size: 1.1em;
        margin: 15px 0 10px;
      }

      .bot-message-bubble ul,
      .bot-message-bubble ol {
        padding-left: 25px;
        margin: 10px 0;
      }

      .bot-message-bubble li {
        margin-bottom: 8px;
        line-height: 1.5;
      }

      .bot-message-bubble table {
        border-collapse: collapse;
        margin: 15px 0;
        width: 100%;
        font-size: 0.85em;
      }

      .bot-message-bubble th {
        background-color: #f8f9fa;
        font-weight: 600;
      }

      .bot-message-bubble td,
      .bot-message-bubble th {
        border: 1px solid #dee2e6;
        padding: 8px 10px;
        text-align: left;
      }

      .bot-message-bubble a {
        color: var(--primary-color);
        text-decoration: underline;
        word-break: break-all;
      }

      .bot-message-bubble strong {
        color: var(--primary-color);
        font-weight: 600;
      }
    `;
  }

  getContainerHTML() {
    return `
      <div id="kyoxai-chatbot-container">
        <div id="kyoxai-chatbot-header">
          <img src="${KyoxAIChatbot.config.BRAND.LOGO}" alt="Chatbot Logo" width="40" height="40" style="border-radius:50%; margin-right:10px;">
          <h4>${KyoxAIChatbot.config.COPY.header}</h4>
        </div>

        <div id="kyoxai-chatbot-messages">
          <div class="system-message">
            ${KyoxAIChatbot.config.COPY.systemMessage}
          </div>
          <div class="message-container bot-message-container">
            <img src="${KyoxAIChatbot.config.BRAND.LOGO}" class="message-icon" alt="Bot Icon">
            <div class="message-bubble bot-message-bubble">
              ${KyoxAIChatbot.config.COPY.initialMessage}
            </div>
          </div>
        </div>

        <div id="kyoxai-chatbot-frequent-questions">
          <h6>Frequent Questions:</h6>
          <div id="frequentQuestions"></div>
        </div>

        <div id="kyoxai-chatbot-input-area">
          <input type="text" id="kyoxai-chatbot-input" placeholder="${KyoxAIChatbot.config.COPY.inputPlaceholder}">
          <button id="kyoxai-chatbot-send">Send</button>
        </div>

        <div id="kyoxai-chatbot-footer">
          ${KyoxAIChatbot.config.COPY.footerHTML}
        </div>
      </div>
    `;
  }

  getToggleButtonHTML() {
    return `
      <button id="kyoxai-chatbot-toggle">
        <img src="${KyoxAIChatbot.config.BRAND.LOGO}" alt="Chatbot Logo">
        <i class="fas fa-chevron-down"></i>
      </button>
    `;
  }

  getMessageHTML(text, sender) {
    const icon = sender === 'user' ? KyoxAIChatbot.config.USER_ICON : KyoxAIChatbot.config.BRAND.LOGO;
    return `
      <div class="message-container ${sender}-message-container">
        <img src="${icon}" class="message-icon" alt="${sender} icon">
        <div class="message-bubble ${sender}-message-bubble">
          ${text}
        </div>
      </div>
    `;
  }

  getLoadingHTML() {
    return `
      <div class="message-container bot-message-container">
        <img src="${KyoxAIChatbot.config.BRAND.LOGO}" class="message-icon" alt="Loading">
        <div class="message-bubble bot-message-bubble loading">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
  }

  initializeApp() {
    this.state = {
      isOpen: false,
      questionCount: 0,
      isProcessing: false
    };

    this.createDOM();
    this.initEventListeners();
    this.initFrequentQuestions();
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.innerHTML = this.getContainerHTML();
    document.body.appendChild(this.container);

    this.toggleButton = document.createElement('div');
    this.toggleButton.innerHTML = this.getToggleButtonHTML();
    document.body.appendChild(this.toggleButton.firstElementChild);
    this.toggleButton = document.getElementById('kyoxai-chatbot-toggle');
  }

  toggleChat() {
    this.state.isOpen = !this.state.isOpen;
    this.container.style.display = this.state.isOpen ? 'flex' : 'none';

    const [img, icon] = this.toggleButton.children;
    img.style.opacity = this.state.isOpen ? '0' : '1';
    icon.style.opacity = this.state.isOpen ? '1' : '0';
  }

  async handleSend() {
    if (this.state.isProcessing) return;

    const input = document.getElementById('kyoxai-chatbot-input');
    const message = input.value.trim();
    
    if (!this.validateMessage(message)) return;

    try {
      this.state.isProcessing = true;
      this.toggleUIState(true);

      this.state.questionCount++;
      this.addMessage(message, 'user');
      input.value = '';

      const loading = this.addLoading();
      const response = await this.sendMessageToAPI(message);
      loading.remove();
      
      this.addMessage(response, 'bot');

    } catch (error) {
      this.handleError(error);
    } finally {
      this.state.isProcessing = false;
      this.toggleUIState(false);
    }
  }

  validateMessage(message) {
    const input = document.getElementById('kyoxai-chatbot-input');
    
    if (!message) return false;

    if (message.length > KyoxAIChatbot.config.behavior.maxContentLength) {
      this.addSystemMessage(KyoxAIChatbot.config.behavior.limitMessages.lengthExceeded);
      input.value = '';
      return false;
    }

    if (this.state.questionCount >= KyoxAIChatbot.config.behavior.maxQuestions) {
      this.addSystemMessage(KyoxAIChatbot.config.behavior.limitMessages.questionLimit);
      input.value = '';
      return false;
    }

    return true;
  }

  async sendMessageToAPI(message) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        session_id: "kyoxai-chatbot"
      })
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Service unavailable - please try again later');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Request failed');
    }

    return data.response;
  }

  addMessage(text, sender) {
    const messagesDiv = document.getElementById('kyoxai-chatbot-messages');
    const formattedText = sender === 'bot' ? this.parseMarkdown(text) : text;
    
    const messageHTML = this.getMessageHTML(formattedText, sender);
    messagesDiv.insertAdjacentHTML('beforeend', messageHTML);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  addLoading() {
    const messagesDiv = document.getElementById('kyoxai-chatbot-messages');
    const loadingHTML = this.getLoadingHTML();
    messagesDiv.insertAdjacentHTML('beforeend', loadingHTML);
    return messagesDiv.lastElementChild;
  }

  addSystemMessage(text) {
    const messagesDiv = document.getElementById('kyoxai-chatbot-messages');
    const systemMessage = document.createElement('div');
    systemMessage.className = 'system-message';
    systemMessage.innerHTML = text;
    messagesDiv.appendChild(systemMessage);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  parseMarkdown(content) {
    try {
      const unsafeHtml = window.marked.parse(content);
      return window.DOMPurify.sanitize(unsafeHtml, {
        ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'h3', 'h4', 'a', 'table', 'tr', 'td', 'th', 'thead', 'tbody'],
        ALLOWED_ATTR: ['href', 'target']
      });
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return content;
    }
  }

  toggleUIState(disabled) {
    const elements = [
      document.getElementById('kyoxai-chatbot-send'),
      ...document.querySelectorAll('.frequent-question-btn')
    ];

    elements.forEach(element => {
      element.disabled = disabled;
      element.style.opacity = disabled ? 0.7 : 1;
      element.style.cursor = disabled ? 'not-allowed' : 'pointer';
    });
  }

  initEventListeners() {
    this.toggleButton.addEventListener('click', () => this.toggleChat());
    document.getElementById('kyoxai-chatbot-send').addEventListener('click', () => this.handleSend());
    document.getElementById('kyoxai-chatbot-input').addEventListener('keypress', e => {
      if (e.key === 'Enter') this.handleSend();
    });
  }

  initFrequentQuestions() {
    const container = document.getElementById('frequentQuestions');
    KyoxAIChatbot.config.FREQUENT_QUESTIONS.forEach(question => {
      const button = document.createElement('button');
      button.className = 'frequent-question-btn';
      button.textContent = question;
      button.addEventListener('click', () => {
        if (this.state.isProcessing) return;
        document.getElementById('kyoxai-chatbot-input').value = question;
        this.handleSend();
      });
      container.appendChild(button);
    });
  }

  loadFontAwesome() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }

  handleError(error) {
    let userMessage;
    if (error instanceof TypeError) {
      userMessage = 'Connection failed. Please check your network';
    } else if (error.message.includes('Unexpected token')) {
      userMessage = 'Service unavailable, please try again later';
    } else {
      userMessage = error.message;
    }
    this.addSystemMessage(userMessage);
  }
}
