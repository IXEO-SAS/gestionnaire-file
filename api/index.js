api/index.js :

const fs = require('fs');
const path = require('path');

let dataPath = path.resolve(__dirname, '../data.json');

function loadData() {
try {
return JSON.parse(fs.readFileSync(dataPath));
} catch {
return { current: 0, lastTicket: 0 };
}
}

function saveData(data) {
fs.writeFileSync(dataPath, JSON.stringify(data));
}

module.exports = (req, res) => {
let data = loadData();

if (req.method === 'GET' && req.url === '/api/ticket') {
data.lastTicket = (data.lastTicket % 999) + 1;
saveData(data);
return res.json({ ticket: data.lastTicket });
}

if (req.method === 'GET' && req.url === '/api/current') {
return res.json({ current: data.current });
}

if (req.method === 'POST' && req.url === '/api/next') {
if (data.current < data.lastTicket) data.current += 1;
saveData(data);
return res.json({ current: data.current });
}

if (req.method === 'POST' && req.url === '/api/prev') {
if (data.current > 1) data.current -= 1;
saveData(data);
return res.json({ current: data.current });
}

if (req.method === 'POST' && req.url === '/api/reset') {
data.current = 0;
data.lastTicket = 0;
saveData(data);
return res.json({ message: 'Réinitialisé' });
}

res.status(404).json({ error: 'Not found' });
};