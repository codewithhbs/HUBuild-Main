const mongoose = require('mongoose');

// Project Schema
const ProviderServiceSchema = new mongoose.Schema({
    category: {
      type: String,
      enum: ['Residential', 'Commercial', 'Landscape'],
      required: true,
    },
    conceptDesignWithStructure: {
      type: String,
      required: true,
    },
    buildingServiceMEP: {
      type: String,
      required: true,
    },
    workingDrawing: {
      type: String,
      required: true,
    },
    interior3D: {
      type: String,
      required: true,
    },
    exterior3D: {
      type: String,
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider', // Reference to Provider model
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  module.exports = mongoose.model('ProviderService', ProviderServiceSchema);