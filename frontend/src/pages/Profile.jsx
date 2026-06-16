import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { User, Mail, Shield, Calendar, Activity, CheckCircle, AlertTriangle, BarChart2, Lock, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const addToast = useToast();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Change Password state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5050/api/analytics');
            setStats(res.data.stats);
        } catch (err) {
            console.error('Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters.');
            return;
        }

        setPasswordLoading(true);
        try {
            await axios.put('http://localhost:5050/api/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            addToast('Password changed successfully!', 'success');
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password.';
            setPasswordError(msg);
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="profile-page animate-fade-in">
            <h2 className="fw-bold mb-4">Account Settings</h2>

            <div className="row g-4">
                {/* Left Column — Avatar + Quick Stats */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center mb-4">
                        <div className="position-relative mx-auto mb-3" style={{ width: '100px', height: '100px' }}>
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle h-100 w-100"
                                style={{
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    color: '#fff',
                                    fontSize: 32,
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                }}
                            >
                                {getInitials(user?.name)}
                            </div>
                            <div
                                className="position-absolute bottom-0 end-0 bg-success rounded-circle"
                                style={{ width: 18, height: 18, border: '3px solid #fff' }}
                            ></div>
                        </div>
                        <h4 className="fw-bold mb-0">{user?.name}</h4>
                        <p className="text-secondary small mb-3">{user?.email}</p>
                        <span className="badge bg-primary-soft text-primary rounded-pill p-2 px-3 mx-auto">
                            Active Member
                        </span>
                    </div>

                    {/* Quick Stats */}
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <h6 className="fw-bold mb-3 d-flex align-items-center">
                            <BarChart2 size={16} className="me-2 text-primary" />
                            Your Activity
                        </h6>
                        {loading ? (
                            <div className="text-center py-3">
                                <div className="skeleton skeleton-card" style={{ height: 80 }}></div>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: '#f0f0ff' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <Activity size={16} style={{ color: '#4f46e5' }} />
                                        <span className="small fw-medium">Total Scans</span>
                                    </div>
                                    <span className="fw-bold" style={{ color: '#4f46e5' }}>{stats?.totalScans || 0}</span>
                                </div>

                                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: '#ecfdf5' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <CheckCircle size={16} style={{ color: '#10b981' }} />
                                        <span className="small fw-medium">Healthy Rate</span>
                                    </div>
                                    <span className="fw-bold" style={{ color: '#10b981' }}>{stats?.healthyPercent || 0}%</span>
                                </div>

                                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: '#fef2f2' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                                        <span className="small fw-medium">Top Disease</span>
                                    </div>
                                    <span className="fw-bold small" style={{ color: '#ef4444' }}>{stats?.mostCommon?.replace('_', ' ') || 'N/A'}</span>
                                </div>

                                <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: '#eff6ff' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <Shield size={16} style={{ color: '#3b82f6' }} />
                                        <span className="small fw-medium">Avg Confidence</span>
                                    </div>
                                    <span className="fw-bold" style={{ color: '#3b82f6' }}>{stats?.avgConfidence || 0}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column — Info */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5 className="fw-bold mb-4 d-flex align-items-center">
                            <User size={20} className="me-2 text-primary" />
                            Personal Information
                        </h5>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-medium text-secondary">Full Name</label>
                                <div className="form-control bg-light border-0 py-2 d-flex align-items-center gap-2">
                                    <User size={14} className="text-muted" />
                                    {user?.name}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-medium text-secondary">Email Address</label>
                                <div className="form-control bg-light border-0 py-2 d-flex align-items-center gap-2">
                                    <Mail size={14} className="text-muted" />
                                    {user?.email}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-medium text-secondary">Role</label>
                                <div className="form-control bg-light border-0 py-2">Farm Inspector</div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-medium text-secondary">Account Status</label>
                                <div className="form-control bg-light border-0 py-2">
                                    <span className="badge bg-success rounded-pill">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5 className="fw-bold mb-4 d-flex align-items-center">
                            <Shield size={20} className="me-2 text-primary" />
                            Security
                        </h5>
                        <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded-3">
                            <div>
                                <h6 className="mb-0 fw-bold" style={{ fontSize: 14 }}>Password</h6>
                                <p className="small text-muted mb-0">••••••••••</p>
                            </div>
                            <button
                                className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                onClick={() => { setShowPasswordModal(true); setPasswordError(''); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                            >
                                Change
                            </button>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: '#fafafa' }}>
                        <div className="d-flex align-items-center gap-2 text-muted small">
                            <Calendar size={14} />
                            <span>Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1050, animation: 'fadeIn 0.2s ease' }}
                    onClick={() => setShowPasswordModal(false)}
                >
                    <div
                        className="bg-white rounded-4 shadow-lg p-4"
                        style={{ width: '100%', maxWidth: 440, animation: 'slideUp 0.3s ease' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <Lock size={20} className="text-primary" />
                            <h5 className="fw-bold mb-0">Change Password</h5>
                        </div>

                        <form onSubmit={handlePasswordChange}>
                            {passwordError && (
                                <div className="alert alert-danger py-2 small d-flex align-items-center">
                                    <AlertTriangle size={14} className="me-2" />
                                    {passwordError}
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label small fw-medium">Current Password</label>
                                <div className="input-group">
                                    <input
                                        type={showCurrent ? 'text' : 'password'}
                                        className="form-control border-0 bg-light"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        required
                                    />
                                    <button type="button" className="btn btn-light border-0" onClick={() => setShowCurrent(!showCurrent)}>
                                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-medium">New Password</label>
                                <div className="input-group">
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        className="form-control border-0 bg-light"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                    <button type="button" className="btn btn-light border-0" onClick={() => setShowNew(!showNew)}>
                                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-medium">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-control border-0 bg-light"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-light rounded-pill flex-fill"
                                    onClick={() => setShowPasswordModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary rounded-pill flex-fill fw-bold"
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                    ) : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
