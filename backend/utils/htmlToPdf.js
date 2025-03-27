const htmlToPdf = require('html-pdf-node');
const fs = require('fs');
const path = require('path');

let options = { format: 'A4', printBackground: true };

/**
 * Generate PDF from HTML content
 * @param {Object|string} html - HTML content as string or { content: 'html' }
 * @returns {Promise<Buffer>} PDF buffer
 */


async function generatePdf(html) {
    // Ensure html is in the correct format
    const content = typeof html === 'string' 
        ? { content: html } 
        : html;
    
    try {
        // Generate PDF
        let pdf = await htmlToPdf.generatePdf(content, options);
        return pdf;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

/**
 * Save PDF to uploads folder
 * @param {Object|string} html - HTML content as string or { content: 'html' }
 * @param {string} fileName - Name of the file to save
 * @param {string} uploadFolder - Path to upload folder (default: 'uploads/pdf')
 * @returns {Promise<string>} - Path to the saved file
 */


async function savePdfToUploads(html, fileName, uploadFolder = 'uploads/pdf') {
    try {
        // Generate PDF buffer
        const pdfBuffer = await generatePdf(html);
        
        // Create upload directory if it doesn't exist
        const uploadPath = path.resolve(process.cwd(), uploadFolder);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        // Create the full file path
        const filePath = path.join(uploadPath, fileName);
        
        // Write the file (will overwrite if it exists)
        console.log((pdfBuffer));
        await fs.promises.writeFile(filePath, pdfBuffer);
        
        return filePath;
    } catch (error) {
        console.error('Error saving PDF to uploads folder:', error);
        throw error;
    }
}

module.exports = { 
    generatePdf,
    savePdfToUploads
};
