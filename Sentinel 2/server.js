require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Initialize App
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// Initialize Cron Jobs
require('./src/services/cronService');

const authRoutes = require('./src/routes/authRoutes');
const shipmentRoutes = require('./src/routes/shipmentRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const vendorRoutes = require('./src/routes/vendorRoutes');
const escrowRoutes = require('./src/routes/escrowRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/escrow', escrowRoutes);

// Test Route
app.get('/', (req, res) => res.send('Sentinel Node API Active'));

// Start Server
const PORT = process.env.PORT || 5000;
app.use((err, req, res, next) => {
    console.error('Express error:', err.message);
    res.status(500).json({ message: err.message });
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));