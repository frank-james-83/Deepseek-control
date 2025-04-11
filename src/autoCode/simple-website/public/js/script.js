document.getElementById('changeBtn').addEventListener('click', function() {
    const messageElement = document.getElementById('message');
    messageElement.textContent = 'Message changed with JavaScript!';
    messageElement.style.color = 'green';
});
