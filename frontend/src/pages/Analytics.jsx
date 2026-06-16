import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';
import { TrendingUp, Activity, AlertTriangle, CheckCircle, Shield, BarChart2, Clock } from 'lucide-react';

const DISEASE_COLORS = {
    'Black_Mold': '#1e1e2f',
    'Green_Mold': '#10b981',
    'Healthy': '#22c55e',
    'Mixed_Infected': '#ef4444',
    'Single_Infected': '#f59e0b',
};

const SEVERITY_COLORS = {
    'None': '#22c55e',
    'Moderate': '#f59e0b',
    'High': '#f97316',
    'Critical': '#ef4444',
};

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get('http://localhost:5050/api/analytics');
            setAnalytics(res.data);
        } catch (err) {
            console.error('Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="analytics-page animate-fade-in">
                <div className="skeleton skeleton-title" style={{ width: 250, marginBottom: 24 }}></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="skeleton skeleton-chart"></div>
                    <div className="skeleton skeleton-chart"></div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="analytics-page animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <AlertTriangle size={48} style={{ color: '#f59e0b', marginBottom: 16 }} />
                <h4>No Analytics Data</h4>
                <p style={{ color: '#6b7280' }}>Upload and analyze some mushroom images first to see analytics.</p>
            </div>
        );
    }

    const { stats, diseaseDistribution, severityBreakdown, timeline, recentActivity } = analytics;

    // Process data for charts
    const pieData = diseaseDistribution.map((item, idx) => ({
        name: item._id.replace('_', ' '),
        value: item.count,
        color: DISEASE_COLORS[item._id] || PIE_COLORS[idx % PIE_COLORS.length]
    }));

    const severityData = severityBreakdown.map(item => ({
        name: item._id || 'Unknown',
        count: item.count,
        fill: SEVERITY_COLORS[item._id] || '#94a3b8'
    }));

    const timelineData = timeline.map(item => ({
        date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scans: item.count
    }));

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getRiskBadgeStyle = (risk) => {
        const colors = {
            'Safe': { bg: '#dcfce7', color: '#166534' },
            'Warning': { bg: '#fef3c7', color: '#92400e' },
            'Critical': { bg: '#fee2e2', color: '#991b1b' },
        };
        const c = colors[risk] || { bg: '#f3f4f6', color: '#374151' };
        return {
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: c.bg,
            color: c.color
        };
    };

    return (
        <div className="analytics-page animate-fade-in">
            <h2 style={{ fontWeight: 700, marginBottom: 24, fontSize: '1.75rem' }}>
                Farm Health Analytics
            </h2>

            {/* ─── 1. STATS CARDS ─────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {/* Total Scans */}
                <div style={cardStyle}>
                    <div style={{ ...iconCircleStyle, backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                        <Activity size={20} />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1e1b4b' }}>{stats.totalScans}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Total Scans</div>
                </div>

                {/* Healthy % */}
                <div style={cardStyle}>
                    <div style={{ ...iconCircleStyle, backgroundColor: '#dcfce7', color: '#16a34a' }}>
                        <CheckCircle size={20} />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#166534' }}>{stats.healthyPercent}%</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Healthy Rate</div>
                </div>

                {/* Most Common Disease */}
                <div style={cardStyle}>
                    <div style={{ ...iconCircleStyle, backgroundColor: '#fee2e2', color: '#dc2626' }}>
                        <AlertTriangle size={20} />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#991b1b', minHeight: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {stats.mostCommon.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Most Common Disease</div>
                </div>

                {/* Avg Confidence */}
                <div style={cardStyle}>
                    <div style={{ ...iconCircleStyle, backgroundColor: '#dbeafe', color: '#2563eb' }}>
                        <Shield size={20} />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a8a' }}>{stats.avgConfidence}%</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Avg Confidence</div>
                </div>
            </div>

            {/* ─── 2 & 3. PIE CHART + TIMELINE ───────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16, marginBottom: 24 }}>
                
                {/* Disease Distribution Pie */}
                <div style={sectionCardStyle}>
                    <h5 style={sectionTitleStyle}>
                        <BarChart2 size={18} style={{ marginRight: 8, color: '#4f46e5' }} />
                        Disease Distribution
                    </h5>
                    <div style={{ width: '100%', height: 300 }}>
                        {pieData.length === 0 ? (
                            <div style={emptyStyle}>No data yet</div>
                        ) : (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                        isAnimationActive={true}
                                        animationDuration={800}
                                        animationBegin={0}
                                        animationEasing="ease-in-out"
                                        startAngle={90}
                                        endAngle={450}
                                        style={{ fontSize: 11 }}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} scans`, 'Count']} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Detection Timeline */}
                <div style={sectionCardStyle}>
                    <h5 style={sectionTitleStyle}>
                        <TrendingUp size={18} style={{ marginRight: 8, color: '#4f46e5' }} />
                        Detection Timeline (Last 30 Days)
                    </h5>
                    <div style={{ width: '100%', height: 300 }}>
                        {timelineData.length === 0 ? (
                            <div style={emptyStyle}>No data in the last 30 days</div>
                        ) : (
                            <ResponsiveContainer>
                                <AreaChart data={timelineData}>
                                    <defs>
                                        <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" style={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} style={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="scans" stroke="#4f46e5" strokeWidth={2}
                                        fillOpacity={1} fill="url(#colorScans)" 
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

            {/* ─── 4 & 5. SEVERITY BREAKDOWN + RECENT ACTIVITY ────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16, marginBottom: 24 }}>

                {/* Severity Breakdown */}
                <div style={sectionCardStyle}>
                    <h5 style={sectionTitleStyle}>
                        <AlertTriangle size={18} style={{ marginRight: 8, color: '#f59e0b' }} />
                        Severity Breakdown
                    </h5>
                    <div style={{ width: '100%', height: 300 }}>
                        {severityData.length === 0 ? (
                            <div style={emptyStyle}>No data yet</div>
                        ) : (
                            <ResponsiveContainer>
                                <BarChart data={severityData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} style={{ fontSize: 11 }} />
                                    <YAxis dataKey="name" type="category" width={80} style={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}
                                        isAnimationActive={true}
                                        animationDuration={800}
                                        animationBegin={0}
                                        animationEasing="ease-in-out">
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={sectionCardStyle}>
                    <h5 style={sectionTitleStyle}>
                        <Clock size={18} style={{ marginRight: 8, color: '#06b6d4' }} />
                        Recent Activity
                    </h5>
                    <div style={{ overflowX: 'auto' }}>
                        {recentActivity.length === 0 ? (
                            <div style={emptyStyle}>No predictions yet</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                        <th style={thStyle}>Date</th>
                                        <th style={thStyle}>Disease</th>
                                        <th style={thStyle}>Confidence</th>
                                        <th style={thStyle}>Severity</th>
                                        <th style={thStyle}>Risk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivity.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={tdStyle}>{formatDate(item.createdAt)}</td>
                                            <td style={{ ...tdStyle, fontWeight: 600 }}>{item.diseaseName.replace('_', ' ')}</td>
                                            <td style={tdStyle}>{item.confidence}</td>
                                            <td style={tdStyle}>{item.severity}</td>
                                            <td style={tdStyle}>
                                                <span style={getRiskBadgeStyle(item.riskLevel)}>{item.riskLevel}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Inline Styles ──────────────────────────────────────────────────────────
const cardStyle = {
    background: '#fff',
    borderRadius: 16,
    padding: '20px 16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #f3f4f6',
    transition: 'transform 0.2s, box-shadow 0.2s',
};

const iconCircleStyle = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 8px',
};

const sectionCardStyle = {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #f3f4f6',
};

const sectionTitleStyle = {
    fontWeight: 600,
    fontSize: 16,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
};

const emptyStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    color: '#9ca3af',
    fontSize: 14,
};

const thStyle = {
    textAlign: 'left',
    padding: '8px 10px',
    color: '#6b7280',
    fontWeight: 600,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const tdStyle = {
    padding: '10px 10px',
    color: '#374151',
};

export default Analytics;
