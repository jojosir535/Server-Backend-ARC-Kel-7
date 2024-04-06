const establishWebSocketConnection = () => {
    const ws = new WebSocket(`wss://server-backend-196-5d221cba3bbc.herokuapp.com/`);
    const messages = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const nama = document.getElementById('name')
    ws.onopen = () => {
        console.log('Connected to the server');
    };

    ws.onmessage = (event) => {
        const messageContent = event.data;
        const message = document.createElement('div');
        if (messageContent === 'ping') {
            message.style.color = 'grey'; // Apply grey color to the message
        }
        message.textContent = messageContent;
        messages.appendChild(message);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('Disconnected from the server');
    };

    sendButton.onclick = () => {
        sendMessage();
    };

    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = messageInput.value;
        const name = nama.value;
        const chat = name + " : " + message;
        ws.send(chat);
        messageInput.value = '';

        // Menambahkan pesan yang dikirim ke dalam textbox "messages"
        const sentMessage = document.createElement('div');
        sentMessage.textContent = chat;
        messages.appendChild(sentMessage);
    }
    
    return ws;
};

// Establish WebSocket connection
let ws = establishWebSocketConnection();

// Check for browser support of the Page Visibility API
if (typeof document.hidden !== "undefined") {
    let hidden = "hidden";
    let visibilityChange = "visibilitychange";
    if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    }

    const handleVisibilityChange = () => {
        if (document[hidden]) {
            // Tab is inactive, you can choose to handle this event
        } else {
            // Tab is active, reconnect to the WebSocket server
            ws.close();
            ws = establishWebSocketConnection();
        }
    };

    // Listen for visibility change events
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
}