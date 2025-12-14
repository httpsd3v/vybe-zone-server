const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
// Configure CORS for Socket.io to allow connections from your frontend domain
const io = socketio(server, {
    cors: {
        // ⚠️ REPLACE THIS ORIGIN WITH THE URL WHERE YOUR index.html IS HOSTED
        origin: "*", // Use "*" during local testing
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 10000;

// Store active users
let activeUsers = [];

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle new user joining and store their name/ID
    socket.on('new user', (username) => {
        const newUser = { id: socket.id, name: username };
        activeUsers.push(newUser);
        io.emit('user list update', activeUsers);
        console.log(`${username} joined.`);
    });

    // Handle incoming messages
    socket.on('chat message', (msg) => {
        const user = activeUsers.find(u => u.id === socket.id);
        if (user && msg) {
            const messageData = {
                user: user.name,
                text: msg,
                timestamp: new Date().toISOString()
            };
            // Send the message to all connected clients
            io.emit('chat message', messageData); 
        }
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        activeUsers = activeUsers.filter(user => user.id !== socket.id);
        // Update user list for everyone else
        io.emit('user list update', activeUsers); 
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

