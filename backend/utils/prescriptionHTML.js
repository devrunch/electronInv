// const { savePdfToUploads } = require('./htmlToPdf');

// async function getPrecriptionHtml(prescription) {
//     // Create sample HTML for prescription
//     const html = `
//         <html>
//           <head>
//             <title>Prescription</title>
//             <style>
//               * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
//               body { padding: 20px; }
//               .container { width: 100%; display: flex; flex-direction: column; }
//               .content { margin-top: 10px; padding: 10px; border: 1px solid #ccc; }
//               .flex { display: flex; flex-wrap: wrap; justify-content: space-between; }
//               .w-1-2 { width: 48%; }
//               .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
//               .table th, .table td { border: 1px solid black; padding: 8px; text-align: left; }
//               .footer {display: flex; justify-content: space-between; background-color: #065f46; color: white; padding: 10px; margin-top: 10px; text-align: center; }
//             </style>
//           </head>
//           <body>
//             <div class="container">
//               <div class="header">
//                <img src="https://aditya.outlfy.com/header.png" alt="logo" style="width: 100%;">
//               </div>

//               <div class="content">
//                 <div class="flex">
//                   <div class="w-1-2">
//                     <p>रोगी का नाम: <strong>${prescription.patient.firstName} ${prescription.patient.lastName}</strong></p>
//                     <p>उम्र : <strong>${new Date().getFullYear() - new Date(prescription.patient.dob).getFullYear()}</strong></p>
//                   </div>
//                   <div class="w-1-2">
//                     <p>संपर्क: <strong>${prescription.patient.contactInfo}</strong></p>
//                     <p>दिनांक: <strong>${new Date(prescription.startDate).toLocaleDateString()}</strong></p>
//                   </div>
//                   <div style="width: 100%;">
//                     <p>रोग: <strong>${prescription.disease}</strong></p>
//                   </div>
//                 </div>

//                 <h2 style="margin-top: 20px;">नुस्खा (Prescription)</h2>
//                 <div style="display: flex; justify-content: space-between;">
//                 <img src="https://aditya.outlfy.com/pres.jpg"  width="250px">
//                 <table class="table">
//                   <thead>
//                     <tr>
//                       <th>दवा</th>
//                       <th>मात्रा</th>
//                       <th>विधि</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     ${prescription.dosages.map(medicine => `
//                     <tr>
//                       <td>${medicine.inventory.name}</td>
//                       <td>${medicine.quantity}</td>
//                       <td>${medicine.frequency}</td>
//                     </tr>
//                     `).join('')}
//                   </tbody>
//                 </table>
//                 </div>

//                 <p style="margin-top: 10px;">चिकित्सक: <strong>${prescription.doctor}</strong></p>
//                 <p>पुनः परामर्श की तिथि: <strong>${new Date(prescription.endDate).toLocaleDateString()}</strong></p>
//               </div>

//               <div class="footer">
//                 <p>■ सभी औषधि हर्बल है</p>
//                 <p>■ वैज्ञानिक कार्यवाही के लिए मान्य नहीं है</p>
//               </div>
//             </div>
//           </body>
//         </html>
//     `;
//     console.log(html);
//     return html;
// }

// module.exports = { getPrecriptionHtml };


const { savePdfToUploads } = require('./htmlToPdf');

async function PdfGenerator(prescription,fileName) {
   
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
                <img src="https://aditya.outlfy.com/static/images/pres.jpg"  width="250px">
                <table class="table">
                  <thead>
                    <tr>
                      <th>दवा</th>
                      <th>मात्रा</th>
                      <th>विधि</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${prescription.dosages.map(medicine => `
                    <tr>
                      <td>${medicine.inventory.name}</td>
                      <td>${medicine.quantity}</td>
                      <td>${medicine.frequency}</td>
                    </tr>
                    `).join('')}
                  </tbody>
                </table>
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
        console.log('Starting PDF generation...');
        
        // Save the PDF
        const pdfPath = await savePdfToUploads(html, fileName);
        
        console.log('✅ PDF generated successfully!');
        console.log(`Saved to: ${pdfPath}`);
        
        return { success: true, path: pdfPath };
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        return { success: false, error };
    }
}

// Run the test
module.exports = { PdfGenerator  };