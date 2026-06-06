const express = require('express');
const cors = require('cors');
const path = require('path');
const configRouter = require('./routes/config');
const exportRouter = require('./routes/export');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3042;

initDb();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/config', configRouter);
app.use('/api/export', exportRouter);

// Serve client build in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Ariane Promo Builder running on port ${PORT}`);
});
