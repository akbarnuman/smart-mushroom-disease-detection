import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
            <div className="container-fluid px-4">
                <Link className="navbar-brand d-flex align-items-center" to={user ? "/dashboard" : "/"}>
                    <Sprout className="me-2" size={28} />
                    <span className="fw-bold tracking-tight">SMDD</span>
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {!user ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-outline-light ms-2 px-4 rounded-pill" to="/register">Register</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item dropdown">
                                    <div className="d-flex align-items-center text-light me-4">
                                        <User size={18} className="me-2" />
                                        <span className="small fw-medium">{user.name}</span>
                                    </div>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-sm btn-light rounded-pill d-flex align-items-center px-3" onClick={handleLogout}>
                                        <LogOut size={14} className="me-2" />
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
