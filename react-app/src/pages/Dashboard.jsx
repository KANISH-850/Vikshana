import React, { useEffect, useState } from 'react';
import { Shield, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import api from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Intelligence Data...</div>;
  if (!data) return <div style={{ color: 'var(--accent-danger)' }}>Error connecting to VIKSHANA core systems.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>Command Center</h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>Real-time intelligence and sector overview.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <DashboardCard title="Total Active Cases" value={data.stats.totalCases.toLocaleString()} icon={Shield} color="#3b82f6" />
        <DashboardCard title="Open Investigations" value={data.stats.openCases.toLocaleString()} icon={SearchIcon} color="#f59e0b" />
        <DashboardCard title="Today's FIRs" value={data.stats.todaysFIR} subtitle={data.stats.crimeTrend} icon={FileText} color="#ef4444" />
        <DashboardCard title="Crime Rate Trend" value={data.stats.crimeTrend} icon={TrendingUp} color={data.stats.crimeTrend.startsWith('-') ? '#10b981' : '#ef4444'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Recent High-Priority Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recentAlerts.map(alert => (
              <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--accent-danger)', borderRadius: '4px' }}>
                <AlertTriangle color="var(--accent-danger)" size={20} />
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{alert.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Live Activity Stream</h3>
          <p style={{ color: 'var(--text-muted)' }}>AI pattern matching initialized...</p>
        </div>
      </div>
    </div>
  );
};

// Polyfill SearchIcon since I didn't import it at the top
const SearchIcon = ({ size, color }) => <Shield color={color} size={size} />; 

export default Dashboard;
