const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// --- In-memory seat storage ---
const seats = {};
const totalSeats = 10; // Example: 10 seats
const LOCK_DURATION = 60 * 1000; // 1 minute

// Initialize seats
for (let i = 1; i <= totalSeats; i++) {
  seats[i] = { id: i, status: "available", lockedBy: null, lockExpiry: null };
}

// --- Routes ---

// Homepage
app.get('/', (req, res) => {
  res.send(`
    <h1>🎟 Welcome to the Ticket Booking API!</h1>
    <p>Use <a href="/seats">/seats</a> to view seats.</p>
    <p>Lock a seat with POST /seats/:id/lock</p>
    <p>Confirm a seat with POST /seats/:id/confirm</p>
  `);
});

// View all seats
app.get('/seats', (req, res) => {
  res.json(Object.values(seats));
});

// Lock a seat
app.post('/seats/:id/lock', (req, res) => {
  const seatId = parseInt(req.params.id);
  const user = req.body.user;

  if (!user) {
    return res.status(400).json({ error: "User is required to lock a seat" });
  }

  const seat = seats[seatId];
  if (!seat) {
    return res.status(404).json({ error: "Seat not found" });
  }

  // Expire old lock if time passed
  if (seat.status === "locked" && Date.now() > seat.lockExpiry) {
    seat.status = "available";
    seat.lockedBy = null;
    seat.lockExpiry = null;
  }

  if (seat.status === "booked") {
    return res.status(409).json({ error: "Seat already booked" });
  }

  if (seat.status === "locked") {
    return res.status(409).json({ error: "Seat already locked by another user" });
  }

  // Lock the seat
  seat.status = "locked";
  seat.lockedBy = user;
  seat.lockExpiry = Date.now() + LOCK_DURATION;

  res.json({ message: `Seat ${seatId} locked by ${user}`, seat });
});

// Confirm booking
app.post('/seats/:id/confirm', (req, res) => {
  const seatId = parseInt(req.params.id);
  const user = req.body.user;

  if (!user) {
    return res.status(400).json({ error: "User is required to confirm a seat" });
  }

  const seat = seats[seatId];
  if (!seat) {
    return res.status(404).json({ error: "Seat not found" });
  }

  // Expire old lock if time passed
  if (seat.status === "locked" && Date.now() > seat.lockExpiry) {
    seat.status = "available";
    seat.lockedBy = null;
    seat.lockExpiry = null;
    return res.status(409).json({ error: "Lock expired. Please lock the seat again." });
  }

  if (seat.status === "booked") {
    return res.status(409).json({ error: "Seat already booked" });
  }

  if (seat.status !== "locked" || seat.lockedBy !== user) {
    return res.status(403).json({ error: "Seat not locked by you" });
  }

  // Confirm booking
  seat.status = "booked";
  seat.lockedBy = null;
  seat.lockExpiry = null;

  res.json({ message: `Seat ${seatId} booked successfully by ${user}`, seat });
});

// --- Start server ---
const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Ticket Booking API running at http://localhost:${port}`);
});
