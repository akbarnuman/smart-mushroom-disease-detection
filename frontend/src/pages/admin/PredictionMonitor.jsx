import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ScanLine, Search, Trash2, Calendar, User, AlertTriangle, Eye, X } from 'lucide-react';
import { useToast } from '../../components/Toast';

const PredictionMonitor = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('All');
    const [selected, setSelected] = useState(null);
    const addToast = useToast();

    useEffect(() => { fetchPredictions(); }, []);

    const fetchPredictions = async () => {
        try {
            const res = await axios.get('http://localhost:5050/api/admin/predictions');
            setPredictions(res.data);
        } catch (err) {
            addToast('Failed to fetch predictions', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Delete this prediction?')) return;
        try {
            await axios.delete(`http://localhost:5050/api/admin/predictions/${id}`);
            setPredictions(predictions.filter(p => p._id !== id));
            if (selected?._id === id) setSelected(null);
            addToast('Prediction deleted.', 'success');
        } catch (err) {
            addToast('Failed to delete prediction', 'error');
        }
    };

    const filtered = predictions.filter(p => {
        const matchSearch = p.diseaseName.toLowerCase().includes(search.toLowerCase()) ||
            (p.userId?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchSeverity = filterSeverity === 'All' || p.severity === filterSeverity;
        return matchSearch && matchSeverity;
    });

    const getSeverityBadge = (s) => {
        const map = {
            'None': 'bg-success-soft text-success',
            'Moderate': 'bg-warning-soft text-warning',
            'High': 'bg-danger-soft text-danger',
            'Critical': 'bg-danger text-white',
        };
        return map[s] || 'bg-light text-dark';
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex align-items-center mb-4">
                <div style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', padding: '8px 12px', borderRadius: 12, marginRight: 12 }}>
                    <ScanLine size={22} color="#fff" />
                </div>
                <div>
                    <h2 className="fw-bold m-0">Prediction Monitor</h2>
                    <small className="text-muted">{predictions.length} total predictions (showing latest 100)</small>
                </div>
            </div>

            {/* Filters */}
            <div className="d-flex gap-2 mb-4 flex-wrap">
                <div className="input-group" style={{ maxWidth: 300 }}>
                    <span className="input-group-text bg-white border-end-0"><Search size={16} className="text-muted" /></span>
                    <input type="text" className="form-control border-start-0" placeholder="Search disease or user..."
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="form-select w-auto" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                    <option value="All">All Severities</option>
                    <option value="None">None</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 border-0 small fw-bold text-uppercase text-secondary">Image</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">User</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Disease</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Confidence</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Severity</th>
                                <th className="py-3 border-0 small fw-bold text-uppercase text-secondary">Date</th>
                                <th className="px-4 py-3 border-0 small fw-bold text-uppercase text-secondary text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">No predictions found</td></tr>
                            ) : filtered.map(p => (
                                <tr key={p._id} onClick={() => setSelected(p)} style={{ cursor: 'pointer' }}>
                                    <td className="px-4 py-3">
                                        <img src={`http://localhost:5050${p.imageUrl}`} alt="Mushroom"
                                            className="rounded shadow-sm" style={{ width: 50, height: 50, objectFit: 'cover' }} />
                                    </td>
                                    <td className="py-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <User size={14} className="text-muted" />
                                            <div>
                                                <div className="fw-medium small">{p.userId?.name || 'Unknown'}</div>
                                                <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.userId?.email || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 fw-medium">{p.diseaseName.replace('_', ' ')}</td>
                                    <td className="py-3"><span className="badge bg-primary-soft text-primary rounded-pill px-3 py-1">{p.confidence}</span></td>
                                    <td className="py-3"><span className={`badge rounded-pill px-3 py-1 ${getSeverityBadge(p.severity)}`}>{p.severity}</span></td>
                                    <td className="py-3 text-secondary small">
                                        <Calendar size={13} className="me-1" />
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-end">
                                        <button className="btn btn-sm btn-icon hover-danger text-secondary" onClick={(e) => handleDelete(p._id, e)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selected && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, animation: 'fadeIn 0.2s ease' }}
                    onClick={() => setSelected(null)}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 550, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                            <h5 className="fw-bold m-0" style={{ fontSize: 16 }}>Prediction Details</h5>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <div className="d-flex gap-3 mb-3 flex-wrap">
                                <img src={`http://localhost:5050${selected.imageUrl}`} alt="" style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 700 }}>{selected.diseaseName.replace('_', ' ')}</div>
                                    <div className="text-muted small mb-2">by {selected.userId?.name || 'Unknown'} • {new Date(selected.createdAt).toLocaleString()}</div>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <span className="badge bg-primary-soft text-primary rounded-pill px-3 py-1">{selected.confidence}</span>
                                        <span className={`badge rounded-pill px-3 py-1 ${getSeverityBadge(selected.severity)}`}>{selected.severity}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="row g-2 mb-3">
                                <div className="col-6"><div className="p-3 bg-light rounded-3"><div className="small text-muted fw-bold">Risk Level</div><div className="fw-medium">{selected.riskLevel}</div></div></div>
                                <div className="col-6"><div className="p-3 bg-light rounded-3"><div className="small text-muted fw-bold">Infection Type</div><div className="fw-medium">{selected.infectionType}</div></div></div>
                            </div>
                            <div className="p-3 bg-light rounded-3 mb-2"><div className="small text-muted fw-bold mb-1">Treatment</div><div className="small">{selected.treatment}</div></div>
                            <div className="p-3 bg-light rounded-3"><div className="small text-muted fw-bold mb-1">Prevention</div><div className="small">{selected.prevention}</div></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictionMonitor;
