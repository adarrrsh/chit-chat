const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from the "public" directory

const users = {}; // Object to store users by room

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('joinRoom', (roomData) => {
        const [room, username] = roomData;
        socket.join(room);
        
        // Add user to the room's user list
        if (!users[room]) {
            users[room] = [];
        }
        users[room].push(username);
        
        // Emit updated user list to the room
        io.to(room).emit('userList', users[room]);
        
        // Emit a message to the room
        io.to(room).emit('message', `${username} has joined the room`);
    });

    socket.on('chatMessage', (msg) => {
        io.to(msg.room).emit('message', `${msg.username}: ${msg.text}`);
    });

    socket.on('disconnect', () => {
        for (let room in users) {
            users[room] = users[room].filter(username => username !== socket.username);
            io.to(room).emit('userList', users[room]);
            io.to(room).emit('message', `${socket.username} has left the room`);
        }
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
