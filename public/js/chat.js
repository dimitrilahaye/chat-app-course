const socket = io();

const chatForm = document.querySelector('#chatForm');
const messageField = document.querySelector('#messageField');
const sendMessage = document.querySelector('#sendMessage');
const sendLocation = document.querySelector('#sendLocation');
const messages = document.querySelector('#messages');
const sidebar = document.querySelector('.chat__sidebar');

const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true});

sendMessage.setAttribute('disabled', 'disabled');

messageField.addEventListener('input', function() {
    if (!!this.value.length) {
        sendMessage.removeAttribute('disabled');
    } else {
        sendMessage.setAttribute('disabled', 'disabled');
    }
});

const injectTemplate = (selector, data) => {
    const html = Mustache.render(document.querySelector(selector).innerHTML, data);
    messages.insertAdjacentHTML('beforeend', html);
}

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error);
        location.href='/';
    }
});

socket.on('message', (message) => {
    injectTemplate('#message-template', {username: message.username, message: message.text, createdAt: moment(message.createdAt).format('h:mm a')});
    autoScroll();
});

socket.on('locationMessage', (location) => {
    injectTemplate('#location-message-template', {username: location.username, message: location.text, createdAt: moment(location.createdAt).format('h:mm a')});
    autoScroll();
});

socket.on('usersUpdate', ({room, users}) => {
    const html = Mustache.render(document.querySelector('#sidebar-template').innerHTML, {users, room});
    sidebar.innerHTML = html;
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage.setAttribute('disabled', 'disabled');
    socket.emit('sendMessage', e.target.elements.message.value, (error) => {
        sendMessage.removeAttribute('disabled');
        if (error) {
            return console.log('Error: ', error);
        }
        messageField.value = '';
        messageField.focus();
        console.log('Message delivered');
    });
});

sendLocation.addEventListener('click', () => {
    if (!navigator.geolocation)  {
        alert('No geolocation available in your browser!');
    }
    sendLocation.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition(({coords}) => {
        socket.emit('sendLocation', {longitude: coords.longitude, latitude: coords.latitude}, (message) => {
            sendLocation.removeAttribute('disabled');
            console.log(message);
        });
    });
});

const autoScroll = () => {
    const lastMessage = messages.lastElementChild;
    const lastMessageMargin = parseInt(getComputedStyle(lastMessage).marginBottom);
    const lastMessageHeight = lastMessage.offsetHeight + lastMessageMargin;
    const visibleHeight = messages.offsetHeight;
    const containerHeight = messages.scrollHeight;
    const scrollOffset = messages.scrollTop + visibleHeight;
    if (containerHeight - lastMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
}