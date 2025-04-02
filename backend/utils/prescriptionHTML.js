const { saveImageToUploads } = require('./htmlToImage');

async function ImageGenerator(prescription, fileName) {
   
     const html = `
        <html>
          <head>
            <title>Prescription</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
              body { padding: 20px; }
              .container { width: 100%; display: flex; flex-direction: column; }
              .content { margin-top: 10px; padding: 10px; border: 1px solid #ccc; }
              .flex { display: flex; flex-wrap: wrap; justify-content: space-between; }
              .w-1-2 { width: 48%; }
              .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              .table th, .table td { border: 1px solid black; padding: 8px; text-align: left; }
              .footer {display: flex; justify-content: space-between; background-color: #065f46; color: white; padding: 10px; margin-top: 10px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
               <img src="https://aditya.outlfy.com/static/images/header.png" alt="logo" style="width: 100%;">
              </div>

              <div class="content">
                <div class="flex">
                  <div class="w-1-2">
                    <p>रोगी का नाम: <strong>${prescription.patient.firstName} ${prescription.patient.lastName}</strong></p>
                    <p>उम्र : <strong>${new Date().getFullYear() - new Date(prescription.patient.dob).getFullYear()}</strong></p>
                  </div>
                  <div class="w-1-2">
                    <p>संपर्क: <strong>${prescription.patient.contactInfo}</strong></p>
                    <p>दिनांक: <strong>${new Date(prescription.startDate).toLocaleDateString()}</strong></p>
                  </div>
                  <div style="width: 100%;">
                    <p>रोग: <strong>${prescription.disease}</strong></p>
                  </div>
                </div>

                <h2 style="margin-top: 20px;">नुस्खा (Prescription)</h2>
                <div style="display: flex; justify-content: space-between;">
                <img src="https://aditya.outlfy.com/static/images/pres.jpg"  width="50%">
                <div style="width: 50%; font-size: 16px;">
                ${prescription.dosages.map(medicine => `
                    <div style="margin-bottom: 15px; border-left: 3px solid #065f46; padding-left: 10px;">
                        <p style="font-weight: bold; color: #065f46;">${medicine.inventory.name}</p>
                        <p style="color: #666; font-style: italic;">${medicine.inventory.directions || ''}</p>
                    </div>
                `).join('')}
                </div>

                </div>

                <p style="margin-top: 10px;">चिकित्सक: <strong>${prescription.doctor}</strong></p>
                <p>पुनः परामर्श की तिथि: <strong>${new Date(prescription.endDate).toLocaleDateString()}</strong></p>
              </div>

              <div class="footer">
                <p>■ सभी औषधि हर्बल है</p>
                <p>■ वैज्ञानिक कार्यवाही के लिए मान्य नहीं है</p>
              </div>
            </div>
          </body>
        </html>
    `;

    try {
        console.log('Starting image generation...');
        
        // Change the file extension from .pdf to .png
        const imageFileName = fileName.replace('.pdf', '.png');
        
        // Save the image
        const imagePath = await saveImageToUploads(html, imageFileName);
        
        console.log('✅ Image generated successfully!');
        console.log(`Saved to: ${imagePath}`);
        
        return { success: true, path: imagePath };
    } catch (error) {
        console.error('❌ Error generating image:', error);
        return { success: false, error };
    }
}

// Export the new function
module.exports = { ImageGenerator };

