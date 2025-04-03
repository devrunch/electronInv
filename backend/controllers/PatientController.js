const { PrismaClient } = require('../../prisma/generated/remote');
const crypto = require('crypto');
const prisma = new PrismaClient();

module.exports = {
  async getAllPatients(req, res) {
    try {
      const patients = await prisma.patient.findMany({
        include: {
          prescriptions: true,
        },
      });
      res.json(patients);
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: 'Server error' });
    }
  },

  async createPatient(req, res) {
    const { firstName, lastName, dob, gender, contactInfo, emergencyContact } = req.body;
    
    if (!firstName || !lastName || !dob || !gender || !contactInfo || !emergencyContact) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Trim contact info
    const trimmedContactInfo = contactInfo.trim();

    const phoneCheck = await prisma.patient.findFirst({
      where: { contactInfo: trimmedContactInfo },
    });
    if (phoneCheck) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }

    try {
      const newPatient = await prisma.patient.create({
        data: {
          firstName,
          lastName,
          dob: new Date(dob),
          gender,
          contactInfo: trimmedContactInfo,
          emergencyContact

        },
      });
      res.json(newPatient);
    } catch (err) {
      console.log(err); 
      res.status(500).json({ error: 'Server error' });
    }
  },
  async getPatientById(req, res) {
    const { id } = req.params;
    try {
      const patient = await prisma.patient.findUnique({
        where: { id: parseInt(id.trim()) },
        include: {
          prescriptions: true,
        },
      });
      if (patient) {
        res.json(patient);
      } else {
        res.status(404).json({ error: 'Patient not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async updatePatient(req, res) {
    const { id } = req.params;
    const { firstName, lastName, contactInfo, emergencyContact, medicalHistory } = req.body;

    // Trim contact info and ID
    const trimmedContactInfo = contactInfo ? contactInfo.trim() : contactInfo;
    const trimmedId = id.trim();

    try {
      const updatedPatient = await prisma.patient.update({
        where: { id: parseInt(trimmedId) },
        data: { 
          firstName, 
          lastName, 
          contactInfo: trimmedContactInfo, 
          emergencyContact, 
          medicalHistory 
        },
      });
      res.json(updatedPatient);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async deletePatient(req, res) {
    const { id } = req.params;
    // Trim ID
    const trimmedId = id.trim();

    try {
      await prisma.patient.delete({ where: { id: parseInt(trimmedId) } });
      res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async quickSearch(req, res) {
   try{
    const {q} = req.query;
    const searchTerm = q.trim().toLowerCase();
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { contactInfo: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
    });
    res.status(200).json(patients);
   }
   catch(err){
    console.log(err)
    res.status(500).json({ error: 'Server error',err });
  }
}

};
