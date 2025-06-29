const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const MEMORY_DIR = path.join(__dirname, 'memories');
if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR);

function loadMemory(userId, partnerId) {
  const filePath = path.join(MEMORY_DIR, `${userId}_${partnerId}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ foods: [], dates: [], triggers: {}, logs: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(filePath));
}

function saveMemory(userId, partnerId, memory) {
  const filePath = path.join(MEMORY_DIR, `${userId}_${partnerId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(memory, null, 2));
}

function updateMemory(memory, message) {
  memory.logs.push({ date: new Date().toISOString(), message });
  const lower = message.toLowerCase();
  if (lower.includes('pizza')) memory.foods.push('pizza');
  if (lower.includes('sushi')) memory.foods.push('sushi');
  if (lower.includes('meu aniversário')) memory.dates.push('aniversário detectado');
  return memory;
}

app.post('/message', (req, res) => {
  const { userId, partnerId, message } = req.body;
  if (!userId || !partnerId || !message) {
    return res.status(400).json({ error: 'Campos obrigatórios: userId, partnerId, message' });
  }
  const memory = loadMemory(userId, partnerId);
  const updatedMemory = updateMemory(memory, message);
  saveMemory(userId, partnerId, updatedMemory);
  res.json({ status: 'ok', updatedMemory });
});

app.get('/memory/:userId/:partnerId', (req, res) => {
  const { userId, partnerId } = req.params;
  try {
    const memory = loadMemory(userId, partnerId);
    res.json(memory);
  } catch (err) {
    res.status(404).json({ error: 'Memória não encontrada' });
  }
});

app.get('/', (req, res) => {
  res.send('LinkAI backend rodando com sucesso.');
});

app.listen(PORT, () => {
  console.log(`Servidor LinkAI rodando na porta ${PORT}`);
});