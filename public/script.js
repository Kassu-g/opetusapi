const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');

let messageHistory = JSON.parse(localStorage.getItem('messageHistory') || '[]');

function renderHistory() {
  chatBox.innerHTML = '';
  messageHistory.forEach(({ sender, text }) => {
    appendMessage(sender, text, false);
  });
}

function appendMessage(sender, message, save = true) {
  const div = document.createElement('div');
  div.classList.add('chat-message', sender);
  div.textContent = message;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  if (save) {
    messageHistory.push({ sender, text: message });
    localStorage.setItem('messageHistory', JSON.stringify(messageHistory));
  }
}

renderHistory();

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  appendMessage('user', message);
  userInput.value = '';
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: message }),
    });
    const data = await response.json();
    appendMessage('bot', data.botMessage);
  } catch (err) {
    appendMessage('bot', 'Virhe palvelimessa. Yritä uudelleen.');
  }
});