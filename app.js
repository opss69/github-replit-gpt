
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const send = document.getElementById('send');

let history = JSON.parse(localStorage.getItem('history') || '[]');

function render() {
  chat.innerHTML = '';
  history.forEach(h => {
    const div = document.createElement('div');
    div.className = 'msg ' + h.role;
    const b = document.createElement('div');
    b.className = 'bubble';
    b.textContent = h.content;
    div.appendChild(b);
    chat.appendChild(div);
  });
  chat.scrollTop = chat.scrollHeight;
}

render();

async function sendMsg() {
  const text = input.value.trim();
  if (!text) return;
  history.push({ role: 'user', content: text });
  render();
  input.value = '';
  localStorage.setItem('history', JSON.stringify(history));

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, history })
  });
  const data = await res.json();
  history.push({ role: 'assistant', content: data.reply || '...' });
  localStorage.setItem('history', JSON.stringify(history));
  render();
}

send.onclick = sendMsg;
input.addEventListener('keydown', e => e.key === 'Enter' && sendMsg());
