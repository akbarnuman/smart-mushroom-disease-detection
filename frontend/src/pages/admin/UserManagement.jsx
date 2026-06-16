import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Trash2, ShieldCheck, User, Calendar, ScanLine } from 'lucide-react';
import { useToast } from '../../components/Toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const addToast = useToast();

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5050/api/admin/users');
            setUsers(res.data);
        } catch (err) {
            addToast('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete user "${name}" and ALL their predictions? This cannot be undone.`)) return;
        try {
            await axios.delete(`http://localhost:5050/api/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            addToast(`User "${name}" deleted successfully.`, 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await axios.patch(`http://localhost:5050/api/admin/users/${id}/role`, { role: newRole });
            setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
            addToast(`Role updated to "${newRole}".`, 'success');
        } catch (err) {
            addToast('Failed to update role', 'error');
        }
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

    return (
        <div className="animate-fade-in">
            <div className="d-flex align-items-center mb-4">
                <div style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', padding: '8px 12px', borderRadius: 12, marginRight: 12 }}>
                    <Users size={22} color="#fff" />
                </div>
                <div>
                    <h2 className="fw-bold m-0">User Management</h2>
                    <small className="text-muted">{users.length} registered users</small>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4" style={{ maxWidth: 400 }}>
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0"><Search size={16} className="text-muted" /></span>
                    <input type="text" className="form-control border-start-0" placeholder="Search by name or email..."
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Users Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 border-0 small fw-bold text-uppercase text-secondary">User</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Email</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Role</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Scans</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Joined</th>
                                <th className="px-4 py-3 border-0 small fw-bold text-uppercase text-secondary text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No users found</td></tr>
                            ) : filtered.map(user => (
                                <tr key={user._id}>
                                    <td className="px-4 py-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{
                                                width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: user.role === 'admin' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                color: '#fff', fontWeight: 700, fontSize: 13
                                            }}>
                                                {getInitials(user.name)}
                                            </div>
                                            <span className="fw-medium">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-secondary small">{user.email}</td>
                                    <td className="py-3">
                                        <select
                                            className="form-select form-select-sm"
                                            style={{ width: 100, fontSize: 12, fontWeight: 600, borderRadius: 8 }}
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="py-3">
                                        <span className="badge bg-primary-soft text-primary rounded-pill px-3 py-1">
                                            <ScanLine size={12} className="me-1" />{user.scanCount}
                                        </span>
                                    </td>
                                    <td className="py-3 text-secondary small">
                                        <Calendar size={13} className="me-1" />
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-end">
                                        <button
                                            className="btn btn-sm btn-icon hover-danger text-secondary"
                                            onClick={() => handleDelete(user._id, user.name)}
                                            title="Delete user"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
