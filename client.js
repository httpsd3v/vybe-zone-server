document.addEventListener('DOMContentLoaded', () => {
    // ⚠️ REPLACE THIS URL WITH YOUR DEPLOYED SERVER'S ADDRESS
    const socket = io('http://localhost:3000'); 
    
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const userListElement = document.getElementById('user-list');
    const userCountElement = document.getElementById('user-count');

    let username = prompt("Welcome to Vybe Zone! What's your name?") || `Guest_${Math.floor(Math.random() * 1000)}`;

    // --- Socket.IO Events ---

    socket.on('connect', () => {
        socket.emit('new user', username);
    });

    socket.on('chat message', (msg) => {
        addMessage(msg.user, msg.text, msg.timestamp, msg.user === username);
    });

    socket.on('user list update', (users) => {
        updateUserList(users);
    });

    // --- UI Handlers ---

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    messageInput.addEventListener('input', toggleSendButton);

    function toggleSendButton() {
        sendButton.disabled = messageInput.value.trim() === '';
    }

    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            socket.emit('chat message', messageText);
            messageInput.value = '';
            toggleSendButton();
        }
    }

    function addMessage(user, text, timestamp, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'message-user' : 'message-other');
        
        // Optionally display the name if it's not the user's message
        if (!isUser) {
            const nameSpan = document.createElement('strong');
            nameSpan.textContent = user;
            messageDiv.appendChild(nameSpan);
            messageDiv.appendChild(document.createElement('br'));
        }

        const textNode = document.createTextNode(text);
        messageDiv.appendChild(textNode);

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        timeSpan.textContent = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageDiv.appendChild(timeSpan);

        messagesContainer.appendChild(messageDiv);
        // Scroll to the bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function updateUserList(users) {
        userListElement.innerHTML = '';
        userCountElement.textContent = users.length;
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.classList.add('user-item');
            
            const avatar = document.createElement('div');
            avatar.classList.add('user-avatar');
            avatar.textContent = user.name[0].toUpperCase();
            
            const userInfo = document.createElement('div');
            userInfo.classList.add('user-info');
            
            const name = document.createElement('div');
            name.classList.add('user-name');
            name.textContent = user.name;
            if (user.id === socket.id) {
                name.innerHTML += ' (You)';
            }

            userInfo.appendChild(name);
            userItem.appendChild(avatar);
            userItem.appendChild(userInfo);
            
            userListElement.appendChild(userItem);
        });
    }
});
