const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const employees = []; // in-memory array of employees

// Homepage
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Employee Management API</h1>
    <p>Use <a href="/api/employees">/api/employees</a> to get JSON data.</p>
    <p>Use <a href="/employees">/employees</a> to view employee list in browser.</p>
  `);
});

// Browser-friendly employee list
app.get('/employees', (req, res) => {
  let html = `
    <h1>Employee List</h1>
    <ul>
  `;

  if (employees.length === 0) {
    html += <li>No employees found</li>;
  } else {
    employees.forEach(emp => {
      html += <li><strong>ID:</strong> ${emp.id} | <strong>Name:</strong> ${emp.name}</li>;
    });
  }

  html += `
    </ul>
    <p><a href="/">Back to Home</a></p>
  `;

  res.send(html);
});

// --- API ENDPOINTS ---

// Get all employees (JSON)
app.get('/api/employees', (req, res) => {
  res.json(employees);
});

// Add a new employee
app.post('/api/employees', (req, res) => {
  const { id, name } = req.body;

  if (!id || !name) {
    return res.status(400).json({ error: 'Employee id and name are required' });
  }

  if (employees.find(emp => emp.id === id)) {
    return res.status(409).json({ error: 'Employee with this id already exists' });
  }

  employees.push({ id, name });
  res.status(201).json({ message: 'Employee added', employee: { id, name } });
});

// Remove employee by id
app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const index = employees.findIndex(emp => emp.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const removed = employees.splice(index, 1);
  res.json({ message: 'Employee removed', employee: removed[0] });
});

// --- Start server ---
const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});