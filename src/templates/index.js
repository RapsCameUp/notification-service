const templateMap = {
  welcome: (data) => `Welcome to the platform, ${data.name || 'user'}!`,
  alert: (data) => `[ALERT] ${data.severity || 'info'}: ${data.message || 'No details'}`,
  reset: (data) => `Reset your password using this link: ${data.link || '#'}`,
};

function render(templateName, data) {
  const fn = templateMap[templateName];
  if (!fn) return `Template "${templateName}" not found`;
  return fn(data);
}

module.exports = { render, templateMap };
