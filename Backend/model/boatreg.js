// models/boatreg.js

const mongoose = require('mongoose');

const boatSchema = new mongoose.Schema({
  boatName: { type: String, required: true },
  boatType: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  priceType: { type: String, enum: ['perNight', 'perHead'], required: true },
  licenseNumber: { type: String, required: true },
  licenseDocument: { type: String }, // File path for license document
  speed: { type: Number, required: true },
  capacity: { type: Number, required: true },
  engineType: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  image: { type: String },// File path for the boat image
  discountPercentage: { type: Number, required: true },
  finalPrice: { type: Number, required: true },
  offerDescription: { type: String, required: true },
  location: { type: String, required: true }, 
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false }, 
  unavailableDates: [Date],// New field for admin approval
  // ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to the boat owner
});

module.exports = mongoose.model('Boatreg', boatSchema);
