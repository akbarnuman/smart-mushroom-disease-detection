const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    diseaseName: { type: String, required: true },
    confidence: { type: String, required: true },
    confidenceLabel: { type: String, default: '' },        // e.g. "Confirmed — Act Now"
    severity: { type: String, required: true },
    infectionType: { type: String, required: true },
    riskLevel: { type: String, required: true },
    treatment: { type: [String], default: [] },            // array of steps
    prevention: { type: [String], default: [] },           // array of steps
    probabilities: { type: Map, of: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
