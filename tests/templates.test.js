const templates = require('../src/templates');
const assert = require('assert');

describe('Notification Templates', () => {
  it('should render welcome template', () => {
    const result = templates.render('welcome', { name: 'Alice' });
    assert.ok(result.includes('Alice'));
  });

  it('should handle unknown template', () => {
    const result = templates.render('unknown', {});
    assert.ok(result.includes('not found'));
  });
});
