export class ChatbotTemplates {
  static getContainerHTML(config) {
    return `
      <div id="kyoxai-chatbot-container">
        <div id="kyoxai-chatbot-header">
          <img src="${config.BRAND.LOGO}" alt="Chatbot Logo" width="40" height="40" style="border-radius:50%; margin-right:10px;">
          <h4>${config.COPY.header}</h4>
        </div>

        <div id="kyoxai-chatbot-messages">
          <div class="system-message">
            ${config.COPY.systemMessage}
          </div>
          <div class="message-container bot-message-container">
            <img src="${config.BRAND.LOGO}" class="message-icon" alt="Bot Icon">
            <div class="message-bubble bot-message-bubble">
              ${config.COPY.initialMessage}
            </div>
          </div>
        </div>

        <div id="kyoxai-chatbot-frequent-questions">
          <h6>Frequent Questions:</h6>
          <div id="frequentQuestions"></div>
        </div>

        <div id="kyoxai-chatbot-input-area">
          <input type="text" id="kyoxai-chatbot-input" placeholder="${config.COPY.inputPlaceholder}">
          <button id="kyoxai-chatbot-send">Send</button>
        </div>

        <div id="kyoxai-chatbot-footer">
          ${config.COPY.footerHTML}
        </div>
      </div>
    `;
  }

  static getToggleButtonHTML(config) {
    return `
      <button id="kyoxai-chatbot-toggle">
        <img src="${config.BRAND.LOGO}" alt="Chatbot Logo">
        <i class="fas fa-chevron-down"></i>
      </button>
    `;
  }

  static getMessageHTML(text, sender, config) {
    const icon = sender === 'user' ? config.USER_ICON : config.BRAND.LOGO;
    return `
      <div class="message-container ${sender}-message-container">
        <img src="${icon}" class="message-icon" alt="${sender} icon">
        <div class="message-bubble ${sender}-message-bubble">
          ${text}
        </div>
      </div>
    `;
  }

  static getLoadingHTML(config) {
    return `
      <div class="message-container bot-message-container">
        <img src="${config.BRAND.LOGO}" class="message-icon" alt="Loading">
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
}
