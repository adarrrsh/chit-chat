const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('joinRoom', (roomData) => {
        const [room, username] = roomData;
        socket.join(room);
        io.to(room).emit('message', `${username} has joined the room`);
    });

    socket.on('chatMessage', (msg) => {
        io.to(msg.room).emit('message', `${msg.username}: ${msg.text}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
