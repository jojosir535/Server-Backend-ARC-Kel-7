const http = require("http");
const express = require("express");
const app = express();
const fs = require('fs');

app.use(express.static("public"));
// require("dotenv").config();

const serverPort = process.env.PORT || 3000;
const server = http.createServer(app);
const WebSocket = require("ws");

let keepAliveId;

const wss =
  process.env.NODE_ENV === "production"
    ? new WebSocket.Server({ server })
    : new WebSocket.Server({ port: 5001 });

server.listen(serverPort);
console.log(`Server started on port ${serverPort} in stage ${process.env.NODE_ENV}`);

wss.on("connection", function (ws, req) {
  console.log("Koneksi dibuka");
  console.log("Client size: ", wss.clients.size);

  if (wss.clients.size === 1) {
    console.log("Koneksi pertama. Memulai keepAlive");
    keepServerAlive();
  }

  ws.on("message", (data) => {
    let stringifiedData = data.toString();
    if (stringifiedData === 'pong') {
      console.log('keepAlive');
      return;
    }
    saveChatToJSON(stringifiedData); // Save chat message to JSON file
    broadcast(ws, stringifiedData, false);
  });

  ws.on("close", (data) => {
    console.log("Menutup koneksi");

    if (wss.clients.size === 0) {
      console.log("User terakhir terputus, mengakhiri interval keepAlive");
      clearInterval(keepAliveId);
    }
  });
});

// Save chat data to a JSON file with timestamp
const saveChatToJSON = (message) => {
  const timestamp = new Date().toISOString();
  const chatData = { timestamp, message };

  fs.appendFile('chats.json', JSON.stringify(chatData) + '\n', (err) => {
    if (err) {
      console.error('Error writing chat data to file:', err);
    }
  });
};

// Implement broadcast function because of ws doesn't have it
const broadcast = (ws, message, includeSelf) => {
  if (includeSelf) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } else {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
};

 const keepServerAlive = () => {
  keepAliveId = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('ping');
      }
    });
  }, 300000);
};


app.get('/', (req, res) => {
    res.send('Ini adalah server backend dari real-time chat.');
});

app.get('/chats.json', (req, res) => {
    res.sendFile('chats.json', { root: __dirname });
});
