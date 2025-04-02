// Save as test-puppeteer.js

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testPuppeteer() {
  console.log('Starting test...');
  
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      protocolTimeout: 120000,
      timeout: 180000
    });
    
    console.log('Creating page...');
    const page = await browser.newPage();
    
    console.log('Loading simple HTML...');
    await page.setContent('<html><body><h1>Test Successful!</h1></body></html>');
    
    console.log('Taking screenshot...');
    const screenshot = await page.screenshot();
    
    console.log('Saving screenshot...');
    fs.writeFileSync('test-screenshot.png', screenshot);
    
    console.log('Closing browser...');
    await browser.close();
    
    console.log('Test completed successfully!');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}