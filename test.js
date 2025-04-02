const { ImageGenerator } = require('./backend/utils/prescriptionHTML');

ImageGenerator({
    patient: {
        firstName: 'John',
        lastName: 'Doe',
        dob: '1990-01-01',
        contactInfo: '1234567890',
    },
    disease: 'Fever',
    dosages: [
        {
            inventory: {
                name: 'Paracetamol',
                directions: 'Take 1 tablet daily',
            },
            quantity: 1,
        },
    ],
    startDate: '2021-01-01',
    endDate: '2021-01-05',
    doctor: 'Dr. John Doe',
}, 'prescription.png');
