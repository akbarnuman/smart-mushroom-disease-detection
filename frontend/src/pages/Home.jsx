import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, BarChart2, UploadCloud, Brain, ClipboardCheck, ArrowRight } from 'lucide-react';

const Home = () => {
    const steps = [
        {
            icon: <UploadCloud size={36} />,
            title: 'Upload Mushroom Image',
            description: 'Upload a clear image of the mushroom crop using drag-and-drop or file selection.',
            color: '#4f46e5',
            bg: 'rgba(79, 70, 229, 0.08)',
        },
        {
            icon: <Brain size={36} />,
            title: 'AI Disease Analysis',
            description: 'The MobileNetV2 deep learning model processes the image and identifies possible diseases in real time.',
            color: '#f59e0b',
            bg: 'rgba(245, 158, 11, 0.08)',
        },
        {
            icon: <ClipboardCheck size={36} />,
            title: 'View Results & Recommendations',
            description: 'Receive disease predictions, confidence scores, and treatment recommendations instantly.',
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.08)',
        },
    ];

    return (
        <div className="home-container">
            <header className="hero text-center py-5 bg-gradient-primary-dark text-white rounded-4 shadow-lg mb-5">
                <div className="container py-5">
                    <h1 className="display-3 fw-bold mb-3 animate-fade-in">Smart Mushroom Disease Detection</h1>
                    <p className="lead mb-4 opacity-75">AI-powered diagnostic system for mushroom farming.</p>
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/register" className="btn btn-light btn-lg px-5 rounded-pill fw-bold shadow">Get Started</Link>
                        <Link to="/login" className="btn btn-outline-light btn-lg px-5 rounded-pill">Login</Link>
                    </div>
                </div>
            </header>

            <section className="features row g-4 py-5">
                <div className="col-md-3 text-center">
                    <div className="feature-card p-4 rounded-4 bg-white shadow-sm border-0 h-100">
                        <div className="icon-box bg-primary-soft text-primary mb-3 mx-auto">
                            <UploadCloud size={32} />
                        </div>
                        <h5>Instant Upload</h5>
                        <p className="text-muted small">Quickly upload high-resolution mushroom images for analysis.</p>
                    </div>
                </div>
                <div className="col-md-3 text-center">
                    <div className="feature-card p-4 rounded-4 bg-white shadow-sm border-0 h-100">
                        <div className="icon-box bg-success-soft text-success mb-3 mx-auto">
                            <ShieldCheck size={32} />
                        </div>
                        <h5>Disease Detection</h5>
                        <p className="text-muted small">Powered by MobileNetV2 deep learning architecture.</p>
                    </div>
                </div>
                <div className="col-md-3 text-center">
                    <div className="feature-card p-4 rounded-4 bg-white shadow-sm border-0 h-100">
                        <div className="icon-box bg-warning-soft text-warning mb-3 mx-auto">
                            <Zap size={32} />
                        </div>
                        <h5>Real-time Results</h5>
                        <p className="text-muted small">Get results in under 3 seconds with treatment advice.</p>
                    </div>
                </div>
                <div className="col-md-3 text-center">
                    <div className="feature-card p-4 rounded-4 bg-white shadow-sm border-0 h-100">
                        <div className="icon-box bg-info-soft text-info mb-3 mx-auto">
                            <BarChart2 size={32} />
                        </div>
                        <h5>Analytics Hub</h5>
                        <p className="text-muted small">Track disease trends and farm health over time.</p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-5 mb-4">
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-2">How It Works</h2>
                    <p className="text-muted">Analyze mushroom diseases in three simple steps using AI-powered image classification.</p>
                </div>

                <div className="row g-4 align-items-stretch justify-content-center">
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <div className="col-md-3">
                                <div
                                    className="text-center p-4 rounded-4 bg-white shadow-sm border-0 h-100 position-relative"
                                    style={{
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'default',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 12px 30px -8px rgba(0,0,0,0.12)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '';
                                    }}
                                >
                                    {/* Step Number Badge */}
                                    <div
                                        className="position-absolute fw-bold text-white d-flex align-items-center justify-content-center"
                                        style={{
                                            top: -14, left: -14, width: 32, height: 32,
                                            borderRadius: '50%', background: step.color,
                                            fontSize: 14, boxShadow: `0 4px 12px ${step.color}40`,
                                        }}
                                    >
                                        {index + 1}
                                    </div>

                                    {/* Icon */}
                                    <div
                                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 72, height: 72, borderRadius: 18,
                                            background: step.bg, color: step.color,
                                        }}
                                    >
                                        {step.icon}
                                    </div>

                                    <h6 className="fw-bold mb-2">{step.title}</h6>
                                    <p className="text-muted small mb-0">{step.description}</p>
                                </div>
                            </div>

                            {/* Connecting Arrow (desktop only, not after last step) */}
                            {index < steps.length - 1 && (
                                <div className="col-auto d-none d-md-flex align-items-center px-0">
                                    <ArrowRight size={24} className="text-muted opacity-25" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
