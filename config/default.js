module.exports = {
  port: process.env.PORT || 3005,
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@prism.ai',
};
