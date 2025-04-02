const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Generate image from HTML content
 * @param {string} html - HTML content as string
 * @param {Object} options - Screenshot options
 * @returns {Promise<Buffer>} Image buffer
 */
async function generateImage(html, options = {}) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        // Set viewport size (A4 paper in pixels at 96 DPI - 8.27 × 11.69 inches)
        await page.setViewport({
            width: 794,  // A4 width at 96 DPI
            height: 1123, // A4 height at 96 DPI
            deviceScaleFactor: 2 // Higher resolution
        });
        
        // Take screenshot
        const imageBuffer = await page.screenshot({
            type: 'png',
            fullPage: true,
            ...options
        });
        
        return imageBuffer;
    } finally {
        await browser.close();
    }
}

/**
 * Save image to uploads folder
 * @param {string} html - HTML content as string
 * @param {string} fileName - Name of the file to save
 * @param {string} uploadFolder - Path to upload folder (default: 'uploads/images')
 * @returns {Promise<string>} - Path to the saved file
 */
async function saveImageToUploads(html, fileName, uploadFolder = 'uploads/images') {
    try {
        // Generate image buffer
        const imageBuffer = await generateImage(html);
        
        // Create upload directory if it doesn't exist
        const uploadPath = path.resolve(process.cwd(), uploadFolder);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        // Create the full file path
        const filePath = path.join(uploadPath, fileName);
        
        // Write the file (will overwrite if it exists)
        await fs.promises.writeFile(filePath, imageBuffer);
        
        return filePath;
    } catch (error) {
        console.error('Error saving image to uploads folder:', error);
        throw error;
    }
}

module.exports = { 
    generateImage,
    saveImageToUploads
}; 