const http = require('http');
const app = require('./app');
const socket = require('socket.io');
const Filter = require('bad-words');
const {generateMessage} = require('./utils/messages');
const {
    addUser,
    removeUser,
    getUser,
    getRoomUsers,
} = require('./utils/users');

const port = process.env.PORT;
const server = http.createServer(app);
const io = socket(server);
const serverBotName = '🤖server chat bot';

io.on('connection', (socket) => {
    console.log('new connection');

    socket.on('join', ({username, room}, cb) => {
        const {error, user} = addUser({id: socket.id, room, username});
        if (error) {
            return cb(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage(serverBotName, 'Hello you!'));
        socket.broadcast.to(user.room).emit('message', generateMessage(serverBotName, `${user.username} has joined the room`));
        io.to(user.room).emit('usersUpdate', {room: user.room, users:getRoomUsers(user.room)});
        cb();
    });

    socket.on('sendMessage', (message, cb) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return cb('Language!');
        }
        io.to(user.room).emit('message', generateMessage(user.username, message));
        cb();
    });

    socket.on('sendLocation', (coords, cb) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        cb('Location shared');
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage(serverBotName, `${user.username} has left!`));
            io.to(user.room).emit('usersUpdate', {room: user.room, users:getRoomUsers(user.room)});
        }
    });
});


server.listen(port, () => console.log('Server is running on port ' + port));