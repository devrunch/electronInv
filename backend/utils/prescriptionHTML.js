const { savePdfToUploads } = require('./htmlToPdf');

async function PdfGenerator(prescription, fileName) {
    console.log(prescription.patient.firstName);
     const html = `
        <html>
  <head>
    <title>Prescription</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
      }
      body {
        padding: 20px;
      }
      .container {
        width: 100%;
        display: flex;
        flex-direction: column;
      }
      .content {
        margin-top: 10px;
        padding: 10px;
        border: 1px solid #ccc;
      }
      .flex {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
      }
      .w-1-2 {
        width: 48%;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      .table th,
      .table td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
      }
      .footer {
        display: flex;
        flex-wrap: wrap;
        gap: 5px 10px;
        background-color: #065f46;
        color: white;
        padding: 10px;
        margin-top: 10px;
        text-align: center;
      }
      h1 {
        color: #d32f2f;
        margin-bottom: 20px;
      }
      .remedy-list {
        padding-left: 0;
        list-style-type: none;
      }
      .remedy-item {
        margin-bottom: 15px;
        display: flex;
        align-items: flex-start;
      }
      .red-square {
        display: inline-block;
        width: 15px;
        height: 15px;
        background-color: #d32f2f;
        margin-right: 10px;
        margin-top: 5px;
        flex-shrink: 0;
      }
      .red-circle {
        display: inline-block;
        width: 15px;
        height: 15px;
        background-color: #d32f2f;
        margin-right: 10px;
        margin-top: 5px;
        flex-shrink: 0;
        border-radius: 50%;
      }
      .remedy-text {
        flex-grow: 1;
      }
      .note {
        font-style: italic;
        margin-top: 5px;
      }
      .flex-1 {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 4px 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img
          src="https://aditya.outlfy.com/static/images/header.png"
          alt="logo"
          style="width: 100%"
        />
      </div>

      <div class="content">
        <div class="flex-1">
          
            <p>
              रोगी का नाम:
              <strong
                >${prescription.patient.firstName}
                ${prescription.patient.lastName}</strong
              >
            </p>
            <p>
              उम्र :
              <strong
                >${new Date().getFullYear() - new
                Date(prescription.patient.dob).getFullYear()}</strong
              >
            </p>
            <p>संपर्क: <strong>${prescription.patient.contactInfo}</strong></p>
            <p>
              दिनांक:
              <strong
                >${new
                Date(prescription.startDate).toLocaleDateString()}</strong
              >
            </p>
        
          <div style="width: 100%; display: flex; gap: 5px">
            <p style="margin-bottom: 10px; color: rgb(95, 6, 6)">
              रोग:${ prescription.disease.split(',').map(disease => `
            </p>

            <p
              style="
                margin-bottom: 10px;
                color: rgb(95, 6, 6);
                background-color: #f0f0f0;
                padding: 5px;
                border-radius: 5px;
              "
            >
              <strong>${disease}</strong>
            </p>
            `).join('') }
          </div>
        </div>

        <div style="display: flex; justify-content: space-between">
          <div style="width: 33%; font-size: 16px">
            <div style="margin-bottom: 10px; background-color: #470000; color: white; padding: 5px; font-weight: bold">आपके रोग</div>
            ${prescription.disease.split(',').map(disease => `
            <p style="margin-bottom: 2px;">
              <span class="red-circle"></span>
              <strong>${disease}</strong>
            </p>
            `).join('')}
          </div>
          <div style="width: 33%;">
          <div style="margin-bottom: 10px; color: #fff; background-color: #470000; padding: 5px; font-weight: bold">औषधियाँ</div>
            ${prescription.dosages.map(medicine => `
            <div
              style="
                margin-bottom: 5px;
                padding-left: 10px;
                display: flex;
              "
            >
            <div>
            <span class="red-circle"></span>
            </div>
            <div>
            <p style="font-weight: bold;">
            ${medicine.inventory.name}
            </p>
            <p style="color: #666; font-style: italic">
            ${medicine.inventory.directions || ''}
            </p>
            <p style="color: #666; font-style: italic">
            ${medicine.quantity} 
            </p>
            </div>
            </div>
            `).join('')}
            <img src="https://aditya.outlfy.com/static/images/pres.jpg" width="90%" />
          </div>
          <div style="width: 33%; font-size: 16px">
            
            <h3
              style="
                margin-bottom: 10px;
                color: rgb(95, 6, 6);
                font-size: 15px;
              "
            >
              औषधि सेवन के समय निम्न बातों का ध्यान रखें :-
            </h3>
            <ul class="remedy-list" style="font-size: 12px">
              <li class="remedy-item">
                <span class="red-square"></span>
                <div class="remedy-text">
                  सभी औषधियाँ हर्बल है, इनके प्रायः साईड इफेक्ट नहीं होते।
                </div>
              </li>

              <li class="remedy-item">
                <span class="red-square"></span>
                <div class="remedy-text">
                  हींग गेहू दाने के बराबर रात्रि में गुड़ में लपेटकर या
                  सब्जी-दाल में डालकर उपयोग करें।
                </div>
              </li>

              <li class="remedy-item">
                <span class="red-square"></span>
                <div class="remedy-text">
                  मुँह में छाले, शरीर में सूजन, पेट में दर्द या गर्मी, कब्ज़ या दस्त, पेट का फूलना या वायु बनना तथा त्वचा में जलन, चकते व खुजली होने की स्थिति में औषधि का सेवन सौंफ के पानी के साथ करें अथवा चिकित्सक से फोन में सम्पर्क करें।
                </div>
              </li>


            </ul>
            <h3
              style="
                margin-bottom: 10px;
                margin-top: 20px;
                font-size: 15px;
                color: rgb(95, 6, 6);
              "
            >
              पीड़ा की स्थिति में :-
            </h3>
            <ul class="remedy-list" style="font-size: 12px">
              <li class="remedy-item">
                <span class="red-square"></span>
                <div class="remedy-text">
                  चिकित्सा के दौरान रोगी को बीच-बीच में 2 से 3 दिनों तक दर्द आ सकता है, क्योंकि नसों में रक्त का प्रवाह नियमित (Repair) होता है, हमारी चिकित्सा में पेन-किलर का उपयोग न के बराबर है, यदि आवश्यक लगे तो आप बाहरी पेन-किलर का उपयोग कर सकते हैं।
                </div>
              </li>
            </ul>
          </div>
        </div>

        <p style="margin-top: 10px">
          चिकित्सक: <strong>${prescription.doctor}</strong>
        </p>
        <p>
          पुनः परामर्श की तिथि:
          <strong
            >${new Date(prescription.endDate).toLocaleDateString()}</strong
          >
        </p>
      </div>

      <div class="footer">
        <p>■ 3 सिटिंग में 80% आराम न होने पर चिकित्सक से प्राकृतिक श्री विधि चिकित्सा का आग्रह करें.</p>
        <p>■ वैज्ञानिक कार्यवाही के लिए मान्य नहीं है</p>
      </div>
    </div>
    <img src="https://aditya.outlfy.com/static/images/PP2.jpg" alt="footer" style="width: 100%">
  </body>
</html>

    `;

    try {
        console.log('Starting image generation...');
        
        // Save the image
        const imagePath = await savePdfToUploads(html, fileName);
        
        console.log('✅ Pdf generated successfully!');
        console.log(`Saved to: ${imagePath}`);
        
        return { success: true, path: imagePath };
    } catch (error) {
        console.error('❌ Error generating pdf:', error);
        return { success: false, error };
    }
}


let mockPrescription = {
    patient: {
        firstName: 'John',
        lastName: 'Doe',
        dob: '1990-01-01',
        contactInfo: '1234567890'
    },
    dosages: [
        {
            inventory: {
                name: 'Paracetamol',
            },
            dosage: '500mg',
            quantity: '2 times a day',
            duration: '10 days'
        },
        {
            inventory: {
                name: 'Aspirin',
            },
            dosage: '100mg',
            quantity: '3 times a day',
            duration: '7 days'
        }
    ],
    disease: 'Fever,Cold',
    startDate: '2025-05-12',
    endDate: '2025-05-19',
    doctor: 'Dr. Smith'
}


module.exports = { PdfGenerator };

