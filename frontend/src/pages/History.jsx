import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trash2, Calendar, X, Shield, AlertTriangle, Stethoscope, ShieldCheck, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useToast } from '../components/Toast';

const PROB_COLORS = ['#1e1e2f', '#10b981', '#22c55e', '#ef4444', '#f59e0b'];

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const addToast = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://localhost:5050/api/history');
            setHistory(res.data);
        } catch (err) {
            console.error('Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            await axios.delete(`http://localhost:5050/api/history/${id}`);
            setHistory(history.filter(item => item._id !== id));
            if (selectedItem && selectedItem._id === id) setSelectedItem(null);
            addToast('Record deleted successfully.', 'success');
        } catch (err) {
            addToast('Failed to delete record.', 'error');
        }
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.diseaseName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || item.severity === filter;
        return matchesSearch && matchesFilter;
    });

    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'None': return 'bg-success-soft text-success';
            case 'Low': return 'bg-success-soft text-success';
            case 'Moderate': return 'bg-warning-soft text-warning';
            case 'High': return 'bg-danger-soft text-danger';
            case 'Critical': return 'bg-danger text-white';
            default: return 'bg-light text-dark';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'None': return '#22c55e';
            case 'Low': return '#22c55e';
            case 'Moderate': return '#f59e0b';
            case 'High': return '#f97316';
            case 'Critical': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'Safe': return { bg: '#dcfce7', color: '#166534' };
            case 'Warning': return { bg: '#fef3c7', color: '#92400e' };
            case 'Critical': return { bg: '#fee2e2', color: '#991b1b' };
            default: return { bg: '#f3f4f6', color: '#374151' };
        }
    };

    // Build probability chart data from selected item
    const getProbChartData = (item) => {
        if (!item || !item.probabilities) return [];
        const probs = item.probabilities;
        // Handle both Map and plain object
        const entries = probs instanceof Map ? Array.from(probs.entries()) : Object.entries(probs);
        return entries.map(([name, value], idx) => ({
            name: name.replace('_', ' '),
            value: parseFloat((value * 100).toFixed(2)),
            fill: PROB_COLORS[idx % PROB_COLORS.length]
        })).sort((a, b) => b.value - a.value);
    };

    return (
        <div className="history-page animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">Prediction History</h2>
                <div className="d-flex gap-2">
                    <div className="input-group" style={{ width: '250px' }}>
                        <span className="input-group-text bg-white border-end-0"><Search size={16} className="text-muted" /></span>
                        <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search disease..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="form-select w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="All">All Severities</option>
                        <option value="None">None</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 border-0 small fw-bold text-uppercase text-secondary">Mushroom Image</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Disease Name</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Confidence</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Severity</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Date</th>
                                <th className="px-4 py-3 border-0 small fw-bold text-uppercase text-secondary text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filteredHistory.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No records found</td></tr>
                            ) : (
                                filteredHistory.map((item) => (
                                    <tr
                                        key={item._id}
                                        onClick={() => setSelectedItem(item)}
                                        style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                                    >
                                        <td className="px-4 py-3">
                                            <img
                                                src={`http://localhost:5050${item.imageUrl}`}
                                                alt="Mushroom"
                                                className="rounded shadow-sm"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                            />
                                        </td>
                                        <td className="py-3 fw-medium">{item.diseaseName.replace('_', ' ')}</td>
                                        <td className="py-3"><span className="badge bg-primary-soft text-primary rounded-pill p-2 px-3">{item.confidence}</span></td>
                                        <td className="py-3"><span className={`badge p-2 px-3 rounded-pill ${getSeverityBadge(item.severity)}`}>{item.severity}</span></td>
                                        <td className="py-3 text-secondary small">
                                            <div className="d-flex align-items-center">
                                                <Calendar size={14} className="me-1" />
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <button className="btn btn-sm btn-icon hover-danger text-secondary" onClick={(e) => handleDelete(item._id, e)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ─── DETAIL MODAL ───────────────────────────────────────── */}
            {selectedItem && (
                <div
                    style={overlayStyle}
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        style={modalStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={modalHeaderStyle}>
                            <h4 style={{ fontWeight: 700, margin: 0, fontSize: 18 }}>Analysis Result</h4>
                            <button onClick={() => setSelectedItem(null)} style={closeButtonStyle}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: 24, overflowY: 'auto', maxHeight: 'calc(90vh - 60px)' }}>
                            {/* Image + Quick Info */}
                            <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
                                <img
                                    src={`http://localhost:5050${selectedItem.imageUrl}`}
                                    alt="Mushroom"
                                    style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    {/* Disease Name */}
                                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1e1b4b', marginBottom: 4 }}>
                                        {selectedItem.diseaseName.replace('_', ' ')}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                                        {selectedItem.mushroomType} • {new Date(selectedItem.createdAt).toLocaleString()}
                                    </div>

                                    {/* Quick stat pills */}
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        <div style={pillStyle('#ede9fe', '#7c3aed')}>
                                            <Activity size={14} /> Confidence: {selectedItem.confidence}
                                        </div>
                                        <div style={pillStyle(getSeverityColor(selectedItem.severity) + '20', getSeverityColor(selectedItem.severity))}>
                                            <AlertTriangle size={14} /> Severity: {selectedItem.severity}
                                        </div>
                                        <div style={pillStyle(getRiskColor(selectedItem.riskLevel).bg, getRiskColor(selectedItem.riskLevel).color)}>
                                            <Shield size={14} /> Risk: {selectedItem.riskLevel}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Cards Row — Infection Type + Risk Level only */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                {/* Infection Type */}
                                <div style={infoCardStyle}>
                                    <div style={infoLabelStyle}>
                                        <Shield size={14} style={{ color: '#6366f1' }} /> Infection Type
                                    </div>
                                    <div style={infoValueStyle}>{selectedItem.infectionType}</div>
                                </div>

                                {/* Risk Level */}
                                <div style={infoCardStyle}>
                                    <div style={infoLabelStyle}>
                                        <ShieldCheck size={14} style={{ color: '#06b6d4' }} /> Risk Level
                                    </div>
                                    <div style={infoValueStyle}>
                                        <span style={{
                                            padding: '2px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                                            backgroundColor: getRiskColor(selectedItem.riskLevel).bg,
                                            color: getRiskColor(selectedItem.riskLevel).color
                                        }}>
                                            {selectedItem.riskLevel}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Treatment — full width */}
                            <div style={{ ...infoCardStyle, marginBottom: 12, borderLeft: '3px solid #10b981' }}>
                                <div style={infoLabelStyle}>
                                    <Stethoscope size={14} style={{ color: '#10b981' }} /> Treatment Steps
                                </div>
                                <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                                    {(Array.isArray(selectedItem.treatment)
                                        ? selectedItem.treatment
                                        : [selectedItem.treatment]
                                    ).map((step, i) => (
                                        <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>{step}</li>
                                    ))}
                                </ol>
                            </div>

                            {/* Prevention — full width */}
                            <div style={{ ...infoCardStyle, marginBottom: 20, borderLeft: '3px solid #f59e0b' }}>
                                <div style={infoLabelStyle}>
                                    <ShieldCheck size={14} style={{ color: '#f59e0b' }} /> Prevention Steps
                                </div>
                                <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                                    {(Array.isArray(selectedItem.prevention)
                                        ? selectedItem.prevention
                                        : [selectedItem.prevention]
                                    ).map((step, i) => (
                                        <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>{step}</li>
                                    ))}
                                </ol>
                            </div>

                            {/* Probability Distribution Chart */}
                            {selectedItem.probabilities && (
                                <div style={{ background: '#f9fafb', borderRadius: 12, padding: 20 }}>
                                    <h6 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: '#374151' }}>
                                        Probability Distribution
                                    </h6>
                                    <div style={{ width: '100%', height: 200 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={getProbChartData(selectedItem)} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} style={{ fontSize: 11 }} />
                                                <YAxis dataKey="name" type="category" width={100} style={{ fontSize: 11 }} />
                                                <Tooltip formatter={(v) => `${v}%`} />
                                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                                                    {getProbChartData(selectedItem).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.2s ease',
};

const modalStyle = {
    background: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 700,
    maxHeight: '90vh',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    animation: 'slideUp 0.25s ease',
};

const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #f3f4f6',
    background: '#fafafa',
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 8,
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
};

const pillStyle = (bg, color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    backgroundColor: bg,
    color: color,
});

const infoCardStyle = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 14,
};

const infoLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    marginBottom: 6,
};

const infoValueStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: '#1f2937',
};

export default History;
