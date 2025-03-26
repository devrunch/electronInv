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

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));

// Routes
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
