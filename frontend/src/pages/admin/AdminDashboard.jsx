import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ScanLine, ShieldCheck, Activity, TrendingUp, AlertTriangle, CheckCircle, Crown } from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area
} from 'recharts';

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const SEVERITY_COLORS = { 'None': '#22c55e', 'Moderate': '#f59e0b', 'High': '#f97316', 'Critical': '#ef4444' };

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('https://smart-mushroom-disease-detection.onrender.com/api/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch admin stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="skeleton skeleton-title" style={{ width: 300, marginBottom: 24 }}></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-card"></div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="skeleton skeleton-chart"></div>
                    <div className="skeleton skeleton-chart"></div>
                </div>
            </div>
        );
    }

    if (!stats) return <div className="text-center py-5 text-muted">Failed to load admin data.</div>;

    const diseaseData = stats.diseaseDistribution.map((d, i) => ({
        name: d._id.replace('_', ' '), value: d.count, color: PIE_COLORS[i % PIE_COLORS.length]
    }));

    const severityData = stats.severityDistribution.map(d => ({
        name: d._id || 'Unknown', count: d.count, fill: SEVERITY_COLORS[d._id] || '#94a3b8'
    }));

    const timelineData = stats.dailyPredictions.map(d => ({
        date: new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scans: d.count
    }));

    const healthyRate = stats.totalPredictions > 0
        ? ((stats.totalHealthy / stats.totalPredictions) * 100).toFixed(1) : 0;

    return (
        <div className="animate-fade-in">
            <div className="d-flex align-items-center mb-4">
                <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '8px 12px', borderRadius: 12, marginRight: 12 }}>
                    <ShieldCheck size={22} color="#fff" />
                </div>
                <div>
                    <h2 className="fw-bold m-0">Admin Dashboard</h2>
                    <small className="text-muted">System-wide overview and monitoring</small>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <StatCard icon={<Users size={20} />} label="Total Users" value={stats.totalUsers} color="#4f46e5" bg="#ede9fe" sub={`+${stats.newUsersThisWeek} this week`} />
                <StatCard icon={<ScanLine size={20} />} label="Total Scans" value={stats.totalPredictions} color="#06b6d4" bg="#cffafe" sub={`+${stats.predictionsThisWeek} this week`} />
                <StatCard icon={<CheckCircle size={20} />} label="Healthy Rate" value={`${healthyRate}%`} color="#10b981" bg="#dcfce7" sub={`${stats.totalHealthy} healthy scans`} />
                <StatCard icon={<AlertTriangle size={20} />} label="Infections Found" value={stats.totalInfected} color="#ef4444" bg="#fee2e2" sub="across all users" />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16, marginBottom: 24 }}>
                {/* Disease Distribution */}
                <div style={cardStyle}>
                    <h6 className="fw-bold mb-3">Disease Distribution (All Users)</h6>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={diseaseData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                                    labelLine={false} 
                                    isAnimationActive={true}
                                    animationDuration={800}
                                    animationBegin={0}
                                    animationEasing="ease-in-out"
                                    startAngle={90}
                                    endAngle={450}
                                    style={{ fontSize: 11 }}>
                                    {diseaseData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Timeline */}
                <div style={cardStyle}>
                    <h6 className="fw-bold mb-3">Scan Activity (Last 30 Days)</h6>
                    <div style={{ height: 280 }}>
                        {timelineData.length === 0 ? (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">No data</div>
                        ) : (
                            <ResponsiveContainer>
                                <AreaChart data={timelineData}>
                                    <defs>
                                        <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" style={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} style={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="scans" stroke="#4f46e5" strokeWidth={2} fill="url(#adminGrad)" 
                                        isAnimationActive={true}
                                        animationDuration={800}
                                        animationBegin={0}
                                        animationEasing="ease-in-out" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
                {/* Severity Breakdown */}
                <div style={cardStyle}>
                    <h6 className="fw-bold mb-3">Severity Breakdown</h6>
                    <div style={{ height: 250 }}>
                        <ResponsiveContainer>
                            <BarChart data={severityData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} style={{ fontSize: 11 }} />
                                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}
                                    isAnimationActive={true}
                                    animationDuration={800}
                                    animationBegin={0}
                                    animationEasing="ease-in-out">
                                    {severityData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Users */}
                <div style={cardStyle}>
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <Crown size={16} style={{ color: '#f59e0b' }} /> Top Users by Scans
                    </h6>
                    <div>
                        {stats.topUsers.length === 0 ? (
                            <div className="text-center text-muted py-4">No users yet</div>
                        ) : (
                            stats.topUsers.map((u, idx) => (
                                <div key={idx} className="d-flex align-items-center justify-content-between py-2 px-2" style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: idx === 0 ? '#fef3c7' : '#f3f4f6', color: idx === 0 ? '#d97706' : '#6b7280',
                                            fontWeight: 700, fontSize: 13
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{u.email}</div>
                                        </div>
                                    </div>
                                    <span className="badge bg-primary-soft text-primary rounded-pill px-3 py-1">{u.scanCount} scans</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color, bg, sub }) => (
    <div style={{
        background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #f3f4f6', transition: 'transform 0.2s',
    }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color, marginBottom: 10 }}>
            {icon}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#1e1b4b' }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
);

const cardStyle = {
    background: '#fff', borderRadius: 16, padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6'
};

export default AdminDashboard;
