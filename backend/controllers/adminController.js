const User = require('../models/User');
const Prediction = require('../models/Prediction');
const mongoose = require('mongoose');

// GET /api/admin/stats — System-wide statistics
exports.getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPredictions = await Prediction.countDocuments();
        const totalHealthy = await Prediction.countDocuments({ diseaseName: 'Healthy' });
        const totalInfected = totalPredictions - totalHealthy;

        // Users registered in last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });

        // Predictions in last 7 days
        const predictionsThisWeek = await Prediction.countDocuments({ createdAt: { $gte: weekAgo } });

        // Disease distribution (system-wide)
        const diseaseDistribution = await Prediction.aggregate([
            { $group: { _id: '$diseaseName', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Severity distribution (system-wide)
        const severityDistribution = await Prediction.aggregate([
            { $group: { _id: '$severity', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Daily predictions (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyPredictions = await Prediction.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top users by scan count
        const topUsers = await Prediction.aggregate([
            { $group: { _id: '$userId', scanCount: { $sum: 1 } } },
            { $sort: { scanCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    scanCount: 1,
                    name: '$user.name',
                    email: '$user.email'
                }
            }
        ]);

        res.json({
            totalUsers,
            totalPredictions,
            totalHealthy,
            totalInfected,
            newUsersThisWeek,
            predictionsThisWeek,
            diseaseDistribution,
            severityDistribution,
            dailyPredictions,
            topUsers
        });
    } catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/admin/users — All users with scan counts
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        // Get scan counts per user
        const scanCounts = await Prediction.aggregate([
            { $group: { _id: '$userId', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        scanCounts.forEach(s => { countMap[s._id.toString()] = s.count; });

        const usersWithStats = users.map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            createdAt: u.createdAt,
            scanCount: countMap[u._id.toString()] || 0
        }));

        res.json(usersWithStats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/admin/users/:id — Delete a user and their predictions
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Don't allow deleting yourself
        if (userId === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Delete user's predictions
        await Prediction.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
        await User.findByIdAndDelete(userId);

        res.json({ message: `User "${user.name}" and their predictions deleted.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PATCH /api/admin/users/:id/role — Change user role
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/admin/predictions — All predictions (system-wide)
exports.getAllPredictions = async (req, res) => {
    try {
        const predictions = await Prediction.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('userId', 'name email');

        res.json(predictions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/admin/predictions/:id — Delete any prediction
exports.deletePrediction = async (req, res) => {
    try {
        await Prediction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Prediction deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
