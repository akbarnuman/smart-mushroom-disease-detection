const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const predictionController = require('../controllers/predictionController');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.put('/auth/change-password', auth, authController.changePassword);

// Prediction Routes
router.post('/predict', auth, upload.single('file'), predictionController.predict);
router.get('/history', auth, predictionController.getHistory);
router.delete('/history/:id', auth, predictionController.deleteHistory);
router.get('/analytics', auth, predictionController.getAnalytics);

// Admin Routes (require auth + admin role)
router.get('/admin/stats', auth, admin, adminController.getSystemStats);
router.get('/admin/users', auth, admin, adminController.getAllUsers);
router.delete('/admin/users/:id', auth, admin, adminController.deleteUser);
router.patch('/admin/users/:id/role', auth, admin, adminController.updateUserRole);
router.get('/admin/predictions', auth, admin, adminController.getAllPredictions);
router.delete('/admin/predictions/:id', auth, admin, adminController.deletePrediction);

module.exports = router;
