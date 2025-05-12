const { PdfGenerator } = require('../prescriptionHTML');
const fs = require('fs');
const path = require('path');

(async () => {
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

    const fileName = 'test-prescription.pdf';
    const filePath = path.resolve(process.cwd(), 'uploads/pdf', fileName);

    // Clean up before
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    console.log('Testing PdfGenerator with valid prescription...');
    try {
        const result = await PdfGenerator(mockPrescription, fileName);
        if (result.success && result.path && fs.existsSync(result.path)) {
            console.log('✅ PDF generated successfully at:', result.path);
        } else {
            console.error('❌ Failed to generate PDF:', result);
            process.exit(1);
        }
    } catch (err) {
        console.error('❌ Exception during PDF generation:', err);
        process.exit(1);
    }

    // Clean up generated file
    
    console.log('Testing PdfGenerator with invalid prescription...');
    try {
        const result = await PdfGenerator({}, fileName);
        if (!result.success && result.error) {
            console.log('✅ Properly handled invalid input:', result.error);
        } else {
            console.error('❌ Did not handle error as expected:', result);
            process.exit(1);
        }
    } catch (err) {
        console.error('❌ Exception during error handling test:', err);
        process.exit(1);
    }

    process.exit(0);
})();