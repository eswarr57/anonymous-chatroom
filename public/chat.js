const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Load history
socket.on('loadMessages', function(msgs){
  msgs.forEach(m => {
    const li = document.createElement('li');
    li.textContent = `${m.username}: ${m.text}`;
    messages.appendChild(li);
  });
  messages.scrollTop = messages.scrollHeight;
});

// New messages
socket.on('message', function(msg){
  const li = document.createElement('li');
  li.textContent = msg;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chatMessage', input.value);
    input.value = '';
  }
});
