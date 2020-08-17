let users = [];

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    if (!username || !room) {
        return {
            error: `user and room are required`
        };
    }
    const existingUserInRoom = users.find((user) => user.room === room && user.username === username);
    if (existingUserInRoom) {
        return {
            error: `${username} has already joined the room`
        };
    }

    const user = {id, username, room};
    users.push(user);
    return {user};
}

const removeUser = (id) => {
    const user =  users.find((user) => user.id === id);
    if (user) {
        users = users.filter((user) => user.id !== id);
        return user;
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getRoomUsers = (room) => {
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getRoomUsers,
};