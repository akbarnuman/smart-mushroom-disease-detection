import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, AlertCircle, CheckCircle2, Info, ArrowRight, BarChart2, ImagePlus, RotateCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useToast } from '../components/Toast';

const Dashboard = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const [resetting, setResetting] = useState(false);
    const addToast = useToast();

    const resetDashboard = () => {
        setResetting(true);
        setTimeout(() => {
            setFile(null);
            setPreview(null);
            setResult(null);
            setError('');
            setLoading(false);
            setDragActive(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setResetting(false);
            addToast('Ready for a new scan!', 'info');
        }, 300);
    };

    const handleFile = (selected) => {
        if (selected && selected.type.startsWith('image/')) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setResult(null);
            setError('');
            addToast('Image loaded! Click "Analyze Mushroom" to start.', 'info');
        } else if (selected) {
            addToast('Please select a valid image file (JPG, PNG).', 'error');
        }
    };

    const handleFileChange = (e) => {
        handleFile(e.target.files[0]);
    };

    // Drag & Drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select an image first.');
            addToast('No image selected.', 'error');
            return;
        }

        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('https://smart-mushroom-disease-detection.onrender.com/api/predict', formData);
            setResult(res.data);
            addToast(`Analysis complete: ${res.data.diseaseName.replace('_', ' ')}`, 'success');
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to get prediction. Ensure the ML API is running.';
            setError(msg);
            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const chartData = result ? Object.entries(result.probabilities).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value: value * 100
    })) : [];

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'None': return 'text-success';
            case 'Low': return 'text-success';
            case 'Moderate': return 'text-warning';
            case 'High': return 'text-danger';
            case 'Critical': return 'text-danger fw-bold';
            default: return 'text-muted';
        }
    };

    return (
        <div className={`dashboard-page animate-fade-in ${resetting ? 'animate-fade-out' : ''}`}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">Disease Detection Hub</h2>
                <span className="badge bg-light text-dark border p-2 px-3 rounded-pill">Model: MobileNetV2</span>
            </div>

            <div className="row g-4">
                {/* Upload Section */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3">Upload Mushroom Image</h5>
                            <div
                                className={`upload-zone rounded-4 border-2 border-dashed ${dragActive ? 'drag-active border-primary' : preview ? 'border-primary' : 'border-secondary'} p-4 text-center cursor-pointer mb-3`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                style={{ cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
                            >
                                <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                                {preview ? (
                                    <img src={preview} alt="Preview" className="img-fluid rounded-3 shadow-sm mb-2" style={{ maxHeight: '250px' }} />
                                ) : (
                                    <div className="py-4">
                                        {dragActive ? (
                                            <>
                                                <ImagePlus size={48} className="text-primary mb-2" style={{ animation: 'pulse 1s infinite' }} />
                                                <p className="text-primary fw-bold">Drop your image here!</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={48} className="text-muted mb-2" />
                                                <p className="text-muted mb-1">Drag & drop an image here</p>
                                                <p className="text-muted mb-1" style={{ fontSize: 13 }}>— or —</p>
                                                <span className="btn btn-outline-primary btn-sm rounded-pill px-3">Browse Files</span>
                                                <div className="mt-2">
                                                    <small className="text-secondary">Supported: JPG, PNG, WebP (Max 5MB)</small>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            {error && <div className="alert alert-danger d-flex align-items-center py-2 small"><AlertCircle size={14} className="me-2" />{error}</div>}
                            <button
                                className="btn btn-primary w-100 py-2 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center"
                                onClick={handleUpload}
                                disabled={loading || !file}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Analyze Mushroom
                                        <ArrowRight size={18} className="ms-2" />
                                    </>
                                )}
                            </button>
                            {result && (
                                <button
                                    className="btn btn-outline-primary w-100 py-2 rounded-pill fw-bold mt-2 d-flex align-items-center justify-content-center"
                                    onClick={resetDashboard}
                                    style={{ letterSpacing: '0.03em' }}
                                >
                                    <RotateCcw size={16} className="me-2" />
                                    Scan Another Image
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
                        {!result ? (
                            <div className="text-center py-5 my-5 text-muted">
                                <Info size={48} className="opacity-25 mb-3" />
                                <p>Analysis results will appear here after upload</p>
                            </div>
                        ) : (
                            <div className="result-content animate-fade-in">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div>
                                        <h4 className="fw-bold m-0">{result.diseaseName.replace('_', ' ')}</h4>
                                        <span className={`small fw-bold ${getSeverityColor(result.severity)}`}>Severity: {result.severity}</span>
                                    </div>
                                    <div className="text-end">
                                        <div className="display-6 fw-bold text-primary">{result.confidence}</div>
                                        <div className="small text-muted">Confidence Score</div>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-3 h-100 border-start border-4 border-warning">
                                            <h6 className="small fw-bold text-uppercase text-secondary">Risk Level</h6>
                                            <p className="mb-0 fw-medium">{result.riskLevel}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 bg-light rounded-3 h-100 border-start border-4 border-info">
                                            <h6 className="small fw-bold text-uppercase text-secondary">Infection Type</h6>
                                            <p className="mb-0 fw-medium">{result.infectionType}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center">
                                        <BarChart2 size={18} className="me-2 text-primary" />
                                        Probability Distribution
                                    </h6>
                                    <div style={{ width: '100%', height: 200 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={chartData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={120} style={{ fontSize: '12px' }} />
                                                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.value > 50 ? '#4f46e5' : '#94a3b8'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="p-4 rounded-4 bg-primary text-white shadow-lg shadow-primary-soft">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h6 className="fw-bold mb-0">Recommended Action</h6>
                                        {result.confidenceLabel && (
                                            <span style={{
                                                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                                background: result.confidenceLabel.includes('Confirmed') ? '#dc2626'
                                                    : result.confidenceLabel.includes('Likely') ? '#d97706' : '#6b7280',
                                                color: '#fff', letterSpacing: '0.03em'
                                            }}>
                                                {result.confidenceLabel}
                                            </span>
                                        )}
                                    </div>
                                    <p className="small fw-bold mb-2 opacity-75 text-uppercase" style={{ letterSpacing: '0.05em' }}>Treatment Steps</p>
                                    <ol className="small mb-0 ps-3" style={{ opacity: 0.92, lineHeight: 1.7 }}>
                                        {(Array.isArray(result.treatment) ? result.treatment : [result.treatment]).map((step, i) => (
                                            <li key={i} className="mb-1">{step}</li>
                                        ))}
                                    </ol>
                                    <div className="my-3 border-top border-white opacity-25"></div>
                                    <p className="small fw-bold mb-2 opacity-75 text-uppercase" style={{ letterSpacing: '0.05em' }}>Prevention Steps</p>
                                    <ol className="small mb-0 ps-3" style={{ opacity: 0.92, lineHeight: 1.7 }}>
                                        {(Array.isArray(result.prevention) ? result.prevention : [result.prevention]).map((step, i) => (
                                            <li key={i} className="mb-1">{step}</li>
                                        ))}
                                    </ol>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
