const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const server = require('http').Server(app);

const PORT = process.env.PORT || 9999; // Используем переменные окружения
const allowedOrigins = process.env.CORS_ORIGIN || '*'; // CORS для продакшн

app.use(cors({
    origin: allowedOrigins.split(','),
    methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = require('socket.io')(server, {
    cors: {
        origin: allowedOrigins.split(','),
        methods: ['GET', 'POST'],
    },
});

const rooms = new Map();

app.get('/rooms/:id', (req, res) => {
    const roomId = req.params.id;
    const obj = rooms.has(roomId)
        ? {
            users: [...rooms.get(roomId).get('users').values()],
            messages: [...rooms.get(roomId).get('messages').values()],
        }
        : { users: [], messages: [] };
    res.json(obj);
});

app.post('/rooms', (req, res) => {
    const { roomId } = req.body;
    if (!rooms.has(roomId)) {
        rooms.set(
            roomId,
            new Map([
                ['users', new Map()],
                ['messages', []],
            ]),
        );
    }
    res.send();
});

io.on('connection', (socket) => {
    socket.on('ROOM:JOIN', ({ roomId, userName }) => {
        socket.join(roomId);
        rooms.get(roomId).get('users').set(socket.id, userName);
        const users = [...rooms.get(roomId).get('users').values()];
        socket.broadcast.to(roomId).emit('ROOM:SET_USERS', users);
    });

    socket.on('ROOM:NEW_MESSAGES', ({ roomId, userName, text }) => {
        const obj = { userName, text };
        console.log('Broadcasting message:', obj);
        rooms.get(roomId).get('messages').push(obj);
        socket.broadcast.to(roomId).emit('ROOM:NEW_MESSAGES', obj);
    });

    socket.on('disconnect', () => {
        rooms.forEach((value, roomId) => {
            if (value.get('users').delete(socket.id)) {
                const users = [...value.get('users').values()];
                socket.broadcast.to(roomId).emit('ROOM:SET_USERS', users);
            }
        });
    });
    console.log('User connected', socket.id);
});

// Раздача статических файлов React
app.use(express.static(path.join(__dirname, 'build')));

// Обработка всех маршрутов
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Запуск сервера
server.listen(PORT, (error) => {
    if (error) {
        console.error('Error starting server:', error);
        throw Error(error);
    }
    console.log(`Server is running on port ${PORT}`);
});
