import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, TrendingUp, Users, Target, Activity } from 'lucide-react';
import api from '../services/api';

const Intelligence = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard')
            .then((res) => {
                if (res.data.success) {
                    setData(res.data.data);
                }
            })
            .catch((err) => console.error('[Intelligence] Dashboard fetch failed:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '20px' }}>Syncing with sector intelligence networks...</div>;
    if (!data) return <div style={{ color: 'var(--accent-danger)', padding: '20px' }}>Failed to establish connection with Vikshana Intelligence Services.</div>;

    return (
        <div className="page-container" style={{ padding: '0 20px', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: '32px' }}>
            <div style={{ marginBottom: '8px', flexShrink: 0 }}>
                <h1 className="premium-title">Crime Intelligence Command</h1>
                <p className="premium-subtitle">Automated sector analysis, high-threat alerts, and suspect tracking feeds.</p>
            </div>

            {/* Top Threat Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', flexShrink: 0 }}>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '10px' }}>
                        <ShieldAlert color="var(--accent-danger)" size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Sector Threat Level</div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-danger)', marginTop: '2px' }}>ELEVATED (LEVEL III)</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '10px' }}>
                        <Target color="var(--accent-warning)" size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Active Suspects</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{data.stats.openCases * 2}</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '10px' }}>
                        <Activity color="var(--accent-primary)" size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Today's Live FIRs</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{data.stats.todaysFIR}</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '10px' }}>
                        <TrendingUp color="var(--accent-success)" size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Trend Analytics</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent-success)', marginTop: '2px' }}>{data.stats.crimeTrend}</div>
                    </div>
                </div>
            </div>

            {/* Split layout for feed and POIs */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '4px' }}>
                {/* Recent High-Priority Alerts */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle color="var(--accent-danger)" size={20} />
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Sector Intel Alerts</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {data.recentAlerts.map((alert) => (
                            <div 
                                key={alert.id} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    gap: '12px', 
                                    padding: '16px', 
                                    background: 'var(--bg-tertiary)', 
                                    borderLeft: '4px solid var(--accent-danger)', 
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    borderLeftWidth: '4px'
                                }}
                            >
                                <AlertTriangle color="var(--accent-danger)" size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{alert.title}</div>
                                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        Threat matching systems flagged suspicious movement in Sector 4. Copilot recommends case analysis matching.
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{alert.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Persons of Interest / Active Suspects panel */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users color="var(--accent-primary)" size={20} />
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Threat Index Watch</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { name: 'Sameer Sen', risk: 'HIGH', status: 'WANTED', avatarText: 'SS', color: 'var(--accent-danger)' },
                            { name: 'Vikram Mehta', risk: 'HIGH', status: 'MONITORED', avatarText: 'VM', color: 'var(--accent-danger)' },
                            { name: 'Nisha Pillai', risk: 'MEDIUM', status: 'PO_INTEREST', avatarText: 'NP', color: 'var(--accent-warning)' },
                            { name: 'Rajesh Nair', risk: 'MEDIUM', status: 'PO_INTEREST', avatarText: 'RN', color: 'var(--accent-warning)' },
                        ].map((poi, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                <div style={{ 
                                    width: '36px', 
                                    height: '36px', 
                                    borderRadius: '50%', 
                                    background: poi.color + '20', 
                                    color: poi.color, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontWeight: '700',
                                    fontSize: '13px'
                                }}>
                                    {poi.avatarText}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{poi.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                                        <span style={{ color: poi.color, fontWeight: '700' }}>{poi.risk} RISK</span>
                                        <span>·</span>
                                        <span>{poi.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Intelligence;
