const express = require('express');
const socket = require('socket.io');

const app = express();
const server = require('http').Server(app);
const io = socket(server);


const rooms = new Map();

app.get('/rooms', (req, res) => {
    res.json(rooms);
});

io.on('connection', (socket) => {
    console.log('User connected');
})

server.listen(9999, (error) => {
    if (error) {
        throw Error(error);
    }
    console.log('Server is running on port 9999');
});
