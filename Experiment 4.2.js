const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// In-memory playing card collection
let cards = [];
let nextId = 1; // auto-increment ID for cards

// --- Homepage ---
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Playing Card Collection API!</h1>
    <p>Use <a href="/cards">/cards</a> to get cards as JSON.</p>
    <p>Use <a href="/cards/view">/cards/view</a> to see cards in HTML view.</p>
  `);
});

// --- RESTful API Endpoints ---

// Get all cards (JSON)
app.get('/cards', (req, res) => {
  res.json(cards);
});

// Add a new card (expects { suit, value })
app.post('/cards', (req, res) => {
  const { suit, value } = req.body;

  if (!suit || !value) {
    return res.status(400).json({ error: "Suit and value are required" });
  }

  const newCard = { id: nextId++, suit, value };
  cards.push(newCard);

  res.status(201).json({ message: "Card added", card: newCard });
});

// Get a specific card by ID
app.get('/cards/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const card = cards.find(c => c.id === id);

  if (!card) {
    return res.status(404).json({ error: "Card not found" });
  }

  res.json(card);
});

// Delete a card by ID
app.delete('/cards/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = cards.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Card not found" });
  }

  const removed = cards.splice(index, 1);
  res.json({ message: "Card deleted", card: removed[0] });
});

// --- HTML view of cards ---
app.get('/cards/view', (req, res) => {
  let html = `
    <h1>Playing Card Collection</h1>
    <ul>
  `;

  if (cards.length === 0) {
    html += `<li>No cards in collection</li>`;
  } else {
    cards.forEach(card => {
      html += `<li><strong>ID:</strong> ${card.id} | <strong>Suit:</strong> ${card.suit} | <strong>Value:</strong> ${card.value}</li>`;
    });
  }

  html += `
    </ul>
    <p><a href="/">Back to Home</a></p>
  `;

  res.send(html);
});

// --- Start server ---
const port = 3000;
app.listen(port, () => {
  console.log(`🃏 Card Collection API running at http://localhost:${port}`);
});
