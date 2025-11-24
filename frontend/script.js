document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let message = document.getElementById("message").value;

    // This creates the Calendly link with pre-filled form fields
    let calendlyUrl = "https://calendly.com/gorightgoleft?name=" + encodeURIComponent(name) + "&email=" + encodeURIComponent(email) + "&message=" + encodeURIComponent(message);

    // Redirects the user to Calendly
    window.location.href = calendlyUrl;
});

// Global variable for the external chatbot script
window.CHATBOT_API = 'https://kyoconnectai-hp-chatbot-1096582767898.europe-west1.run.app/chat';
