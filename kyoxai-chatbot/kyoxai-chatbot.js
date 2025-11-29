import { defaultConfig } from './config/default-config.js';
import { ChatbotTemplates } from './templates/chatbot-template.js';

class KyoxAIChatbot {
  static config = { ...defaultConfig };

  constructor(config = {}) {
    this.initializeConfig(config);
    
    this.loadDependencies().then(() => {
      this.loadStyles();
      this.initializeApp();
    });
  }

  initializeConfig(userConfig) {
    // Merge configurations
    if (userConfig.BRAND) {
      KyoxAIChatbot.config.BRAND = { 
        ...KyoxAIChatbot.config.BRAND, 
        ...userConfig.BRAND 
      };
    }
    
    // Initialize dynamic COPY texts
    this.initializeCopyTexts();
    
    // Set API endpoint
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

      // Load marked
      const markedScript = document.createElement('script');
      markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
      markedScript.onload = checkLoaded;
      document.head.appendChild(markedScript);

      // Load DOMPurify
      const purifyScript = document.createElement('script');
      purifyScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.5/purify.min.js';
      purifyScript.onload = checkLoaded;
      document.head.appendChild(purifyScript);
    });
  }

  loadStyles() {
    // Check if styles are already loaded
    if (document.getElementById('kyoxai-chatbot-styles')) return;

    const link = document.createElement('link');
    link.id = 'kyoxai-chatbot-styles';
    link.rel = 'stylesheet';
    link.href = './styles/chatbot.css';
    document.head.appendChild(link);

    this.loadFontAwesome();
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
    // Create main container
    this.container = document.createElement('div');
    this.container.innerHTML = ChatbotTemplates.getContainerHTML(KyoxAIChatbot.config);
    document.body.appendChild(this.container);

    // Create toggle button
    this.toggleButton = document.createElement('div');
    this.toggleButton.innerHTML = ChatbotTemplates.getToggleButtonHTML(KyoxAIChatbot.config);
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
    
    const messageHTML = ChatbotTemplates.getMessageHTML(
      formattedText, 
      sender, 
      KyoxAIChatbot.config
    );
    
    messagesDiv.insertAdjacentHTML('beforeend', messageHTML);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  addLoading() {
    const messagesDiv = document.getElementById('kyoxai-chatbot-messages');
    const loadingHTML = ChatbotTemplates.getLoadingHTML(KyoxAIChatbot.config);
    
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

export default KyoxAIChatbot;
