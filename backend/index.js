const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes.js');
const patientRoutes = require('./routes/patientRoutes');
const suppRoutes = require('./routes/supplierRoute.js');
const prescriptionRoute = require('./routes/prescriptionRoute');
const purchaseRoute = require('./routes/purchaseRoutes');
const logRoutes = require('./routes/logRoutes');
const userRoutes = require('./routes/userRoutes');
const syncService = require('./syncService');
const path = require('path');
const fs = require('fs');
dotenv.config();
const app = express();

// Configure CORS
app.use(cors({
    origin: '*',
    credentials: true
}));

// Configure body parser with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create uploads directory if it doesn't exist
const uploadsPath = path.join(__dirname, '../uploads/pdf');
const imagesPath = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
}

// Serve static files from uploads directory
app.use('/static', express.static(path.join(__dirname, '../uploads')));

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'dist-react')));

// Add a specific route for PDF downloads
app.get('/download/pdf/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/pdf', filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        res.download(filePath); // This sets the appropriate headers for download
    } else {
        res.status(404).send('File not found');
    }
});

// Add a specific route for image downloads
app.get('/download/image/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/images', filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        res.download(filePath); // This sets the appropriate headers for download
    } else {
        res.status(404).send('Image not found');
    }
});

// url should be http://localhost:3000/uploads/pdf/
//file should be pdf and available at http://localhost:3000/uploads/pdf/test.pdf
const PORT = process.env.PORT || 3000;

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/suppliers', suppRoutes);
app.use('/api/prescriptions', prescriptionRoute);
app.use('/api/purchases', purchaseRoute);
app.use('/api/logs', logRoutes);
app.get('/api/sync', async (req, res) => {
  try{
    await syncService.syncService()
    res.status(200).json({message: 'Synced successfully'});
  }
  catch(err){
    console.log(err)
    res.status(500).json({error: 'Failed to sync'});
  }
});

// Serve React app for any other routes (handle client-side routing)
app.get('*', (req, res) => {
  // Don't serve React app for API routes
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist-react', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`React app is served at http://localhost:${PORT}`);
});
