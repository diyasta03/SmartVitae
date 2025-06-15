const { existsSync } = require('fs');
const { join } = require('path');

/**
 * @type {import('puppeteer').Configuration}
 */
module.exports = {
  cacheDirectory: existsSync(join(process.cwd(), '.next'))
    ? join(process.cwd(), '.next', 'cache', 'puppeteer')
    : join(process.cwd(), '.cache', 'puppeteer'),
};