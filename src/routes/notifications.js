const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const templates = require('../templates');

router.post('/email', (req, res) => {
  const { to, subject, body, template } = req.body;
  if (!to || !subject) {
    return res.status(400).json({ error: 'to and subject required' });
  }
  const content = template ? templates.render(template, req.body) : body;
  logger.info(`Email sent to ${to}: ${subject}`);
  res.json({
    notificationId: `NOTIF-${Date.now()}`,
    channel: 'email',
    status: 'sent',
    to,
    subject,
  });
});

router.post('/slack', (req, res) => {
  const { channel, message } = req.body;
  if (!channel || !message) {
    return res.status(400).json({ error: 'channel and message required' });
  }
  logger.info(`Slack message to #${channel}`);
  res.json({
    notificationId: `NOTIF-${Date.now()}`,
    channel: 'slack',
    status: 'sent',
    slackChannel: channel,
  });
});

router.post('/webhook', (req, res) => {
  const { url, payload } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  logger.info(`Webhook fired to ${url}`);
  res.json({
    notificationId: `NOTIF-${Date.now()}`,
    channel: 'webhook',
    status: 'sent',
    url,
  });
});

module.exports = router;
