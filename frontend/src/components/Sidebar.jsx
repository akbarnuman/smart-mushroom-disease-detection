import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, PieChart, UserCircle, ShieldCheck, Users, Activity, ScanLine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { isAdmin } = useAuth();

    const linkClass = ({ isActive }) =>
        `nav-link d-flex align-items-center px-3 py-2 rounded transition-all ${isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-light-opacity'}`;

    return (
        <div className="bg-dark text-light vh-100 p-3 shadow">
            <h6 className="text-secondary text-uppercase small fw-bold mb-4 px-3">Main Menu</h6>
            <nav className="nav flex-column gap-2">
                <NavLink to="/dashboard" className={linkClass}>
                    <LayoutDashboard size={20} className="me-3" />
                    Dashboard
                </NavLink>
                <NavLink to="/history" className={linkClass}>
                    <History size={20} className="me-3" />
                    History
                </NavLink>
                <NavLink to="/analytics" className={linkClass}>
                    <PieChart size={20} className="me-3" />
                    Analytics
                </NavLink>
                <hr className="my-4 border-secondary opacity-25" />
                <h6 className="text-secondary text-uppercase small fw-bold mb-3 px-3">Account</h6>
                <NavLink to="/profile" className={linkClass}>
                    <UserCircle size={20} className="me-3" />
                    Profile
                </NavLink>

                {isAdmin && (
                    <>
                        <hr className="my-4 border-secondary opacity-25" />
                        <h6 className="text-uppercase small fw-bold mb-3 px-3 d-flex align-items-center gap-2" style={{ color: '#f59e0b' }}>
                            <ShieldCheck size={14} />
                            Admin Panel
                        </h6>
                        <NavLink to="/admin" end className={linkClass}>
                            <Activity size={20} className="me-3" />
                            System Overview
                        </NavLink>
                        <NavLink to="/admin/users" className={linkClass}>
                            <Users size={20} className="me-3" />
                            User Management
                        </NavLink>
                        <NavLink to="/admin/predictions" className={linkClass}>
                            <ScanLine size={20} className="me-3" />
                            All Predictions
                        </NavLink>
                    </>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;
