import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="text-center mb-4">
                    <div className="icon-circle bg-success text-white mx-auto mb-3">
                        <UserPlus size={24} />
                    </div>
                    <h2 className="fw-bold">Create Account</h2>
                    <p className="text-muted small">Join the smart mushroom community</p>
                </div>
                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-medium">Full Name</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><User size={16} className="text-muted" /></span>
                            <input type="text" className="form-control border-start-0 bg-light" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-medium">Email Address</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><Mail size={16} className="text-muted" /></span>
                            <input type="email" className="form-control border-start-0 bg-light" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label small fw-medium">Password</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><Lock size={16} className="text-muted" /></span>
                            <input type="password" className="form-control border-start-0 bg-light" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-success w-100 py-2 rounded-pill fw-bold shadow-sm">Sign Up</button>
                </form>
                <div className="text-center mt-4">
                    <p className="small text-muted mb-0">Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
