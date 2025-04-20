let ws;
function connectWebSocket() {
  ws = new WebSocket("ws://127.0.0.1:5008");
  ws.onopen = () => addServerMessage("WebSocket Connected!");
  ws.onmessage = (event) => handleServerMessage(event.data);
  ws.onclose = () => setTimeout(connectWebSocket, 5000);
  ws.onerror = (error) => addServerMessage(`WebSocket Error: ${error.message || 'Unknown error'}`);
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (message && ws && ws.readyState === WebSocket.OPEN) {
    addUserMessage(message);
    ws.send(JSON.stringify([{ type: "text", data: { text: message } }]));
    input.value = "";
  }
}

function addUserMessage(message) {
  const chatContainer = document.getElementById("chatContainer");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", "user-message");
  messageDiv.textContent = message;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
async function processMessage(msg) {
  if (!msg || !msg.type) {
    console.warn("无效消息:", msg);
    return;
  }

  // 处理 node（递归解析）
  if (msg.type === "node" && msg.data && msg.data.content) {
    console.log("处理 node 消息:", msg.data);
    for (const content of msg.data.content) {
      await processMessage(content);
    }
    return;
  }

  // 处理文本消息
  if (msg.type === "text" && msg.data?.text?.trim()) {
    console.log("添加文本消息:", msg.data.text);
    addServerMessage(msg.data.text);
    return;
  }

  // 处理图片消息
  if (msg.type === "image" && msg.data?.file) {
    let imageUrl = msg.data.file;
    if (imageUrl.startsWith("file://")) {
      imageUrl = await convertFileToBase64(imageUrl);
      if (!imageUrl) return;
    }
    console.log("添加图片消息:", imageUrl);
    addImageMessage(imageUrl);
    return;
  }

  console.warn("未知消息类型:", msg);
}

async function handleServerMessage(rawData) {
  try {
    const data = JSON.parse(rawData);

    if (!data.message || !data.message.params) {
      console.warn("收到无效消息:", data);
      return;
    }

    let messages = data.message.params.messages || data.message.params.message; // 兼容 node 和普通消息
    if (!Array.isArray(messages)) {
      console.warn("消息格式错误:", messages);
      return;
    }

    for (const msg of messages) {
      await processMessage(msg);
    }
  } catch (e) {
    console.error("解析服务器消息失败:", e);
    addServerMessage("[Invalid message format]");
  }
}






function addServerMessage(message) {
  if (!message.trim()) return;  // 如果 message 为空或仅包含空格，则不显示

  const chatContainer = document.getElementById("chatContainer");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", "server-message");
  messageDiv.textContent = message;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}


async function convertFileToBase64(filePath) {
  try {
    const response = await fetch("http://127.0.0.1:5007/api/file2base64", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath })
    });

    const data = await response.json();
    if (data.base64) {
      return data.base64;  // 返回 base64 数据
    } else {
      console.error("Error:", data.error);
      return null;
    }
  } catch (error) {
    console.error("Request failed:", error);
    return null;
  }
}

async function addImageMessage(imagePath) {
  if (imagePath.startsWith("file://")) {
    imagePath = await convertFileToBase64(imagePath);
    if (!imagePath) return;  // 如果转换失败，直接返回
  }

  const chatContainer = document.getElementById("chatContainer");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", "server-message");
  messageDiv.style.maxWidth = "20%"; // 让 div 自适应但不太宽

  const img = document.createElement("img");
  img.src = imagePath;
  img.style.width = "100%"; // 让图片填充父容器
  img.style.borderRadius = "8px"; // 让图片更美观

  messageDiv.appendChild(img);
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}



document.addEventListener("DOMContentLoaded", connectWebSocket);
document.getElementById('messageInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
    event.preventDefault();
  }
});