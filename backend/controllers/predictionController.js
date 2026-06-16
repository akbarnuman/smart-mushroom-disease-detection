const Prediction = require('../models/Prediction');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

exports.predict = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

        const filePath = req.file.path;
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        // Send to Flask API
        const flaskResponse = await axios.post(process.env.FLASK_API_URL, formData, {
            headers: formData.getHeaders()
        });

        const mlResult = flaskResponse.data;

        // Save to MongoDB
        const prediction = new Prediction({
            userId: req.user.id,
            imageUrl: `/uploads/${req.file.filename}`,
            diseaseName: mlResult.disease,
            confidence: mlResult.confidence,
            confidenceLabel: mlResult.confidence_label,
            severity: mlResult.severity,
            infectionType: mlResult.infection_type,
            riskLevel: mlResult.risk_level,
            treatment: mlResult.treatment,
            prevention: mlResult.prevention,
            probabilities: mlResult.all_probabilities
        });

        await prediction.save();
        res.status(200).json(prediction);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Prediction failed: ' + (err.response?.data?.error || err.message) });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await Prediction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteHistory = async (req, res) => {
    try {
        await Prediction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Prediction deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Disease Distribution (pie chart)
        const diseaseDistribution = await Prediction.aggregate([
            { $match: { userId } },
            { $group: { _id: '$diseaseName', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 2. Severity Breakdown (bar chart)
        const severityBreakdown = await Prediction.aggregate([
            { $match: { userId } },
            { $group: { _id: '$severity', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 3. Detection Timeline (last 30 days, grouped by date)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const timeline = await Prediction.aggregate([
            { $match: { userId, createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 4. Stats Cards
        const totalScans = await Prediction.countDocuments({ userId });

        const healthyCount = await Prediction.countDocuments({ userId, diseaseName: 'Healthy' });
        const healthyPercent = totalScans > 0 ? ((healthyCount / totalScans) * 100).toFixed(1) : 0;

        // Average confidence (stored as string like "85.32%", need to parse)
        const allPredictions = await Prediction.find({ userId }, 'confidence diseaseName');
        let avgConfidence = 0;
        if (allPredictions.length > 0) {
            const total = allPredictions.reduce((sum, p) => {
                const val = parseFloat(p.confidence);
                return sum + (isNaN(val) ? 0 : val);
            }, 0);
            avgConfidence = (total / allPredictions.length).toFixed(1);
        }

        // Most common disease
        const mostCommon = diseaseDistribution.length > 0 ? diseaseDistribution[0]._id : 'N/A';

        // 5. Recent Activity (last 10)
        const recentActivity = await Prediction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('diseaseName confidence severity riskLevel createdAt');

        res.json({
            stats: {
                totalScans,
                healthyPercent: parseFloat(healthyPercent),
                avgConfidence: parseFloat(avgConfidence),
                mostCommon
            },
            diseaseDistribution,
            severityBreakdown,
            timeline,
            recentActivity
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: err.message });
    }
};
