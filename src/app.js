const express = require('express');
const notificationRoutes = require('./routes/notifications');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use('/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service', uptime: process.uptime() });
});

app.listen(PORT, () => {
  logger.info(`notification-service running on port ${PORT}`);
});

module.exports = app;
