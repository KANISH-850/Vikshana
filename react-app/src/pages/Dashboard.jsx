import React, { useEffect, useState } from 'react';
import { Shield, FileText, AlertTriangle, TrendingUp, Users, Activity, CheckSquare, Search, Network, Map, Clock, Target, DollarSign, Database, Brain, Cpu, Server } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
<<<<<<< Updated upstream
import { useLanguage } from '../context/LanguageContext';
=======
import useAuth from '../hooks/useAuth';
>>>>>>> Stashed changes
import api from '../services/api';

const AdminDashboard = ({ data }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
    <DashboardCard title="Platform Statistics" value={data?.stats?.totalCases || 1542} icon={Server} color="#3b82f6" />
    <DashboardCard title="User Statistics" value="128 Active" icon={Users} color="#8b5cf6" />
    <DashboardCard title="Audit Summary" value="99.9% Pass" icon={Shield} color="#10b981" />
    <DashboardCard title="Forecast Summary" value="Processed" icon={TrendingUp} color="#f59e0b" />
    <DashboardCard title="System Health" value="Optimal" icon={Activity} color="#10b981" />
  </div>
);

const InvestigatorDashboard = ({ data }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
    <DashboardCard title="Assigned Investigations" value="7" icon={Search} color="#3b82f6" />
    <DashboardCard title="Active FIRs" value={data?.stats?.todaysFIR || 3} icon={FileText} color="#ef4444" />
    <DashboardCard title="Evidence Status" value="2 Pending Lab" icon={Database} color="#f59e0b" />
    <DashboardCard title="Pending Actions" value="4 Urgent" icon={CheckSquare} color="#ef4444" />
    <DashboardCard title="Offender Alerts" value="1 Match" icon={AlertTriangle} color="#ef4444" />
  </div>
);

const AnalystDashboard = ({ data }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
    <DashboardCard title="Crime Trends" value={data?.stats?.crimeTrend || '+4.2%'} icon={TrendingUp} color="#ef4444" />
    <DashboardCard title="Relationship Graph" value="242 Nodes" icon={Network} color="#8b5cf6" />
    <DashboardCard title="Forecast" value="High Risk (Q3)" icon={Brain} color="#f59e0b" />
    <DashboardCard title="Heatmap" value="Updated" icon={Map} color="#3b82f6" />
    <DashboardCard title="Sociological Analytics" value="Processing" icon={Users} color="#10b981" />
  </div>
);

const SupervisorDashboard = ({ data }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
    <DashboardCard title="Investigation Progress" value="68%" icon={Target} color="#3b82f6" />
    <DashboardCard title="Officer Workload" value="High" icon={Activity} color="#f59e0b" />
    <DashboardCard title="Pending Approvals" value="12" icon={CheckSquare} color="#ef4444" />
    <DashboardCard title="Critical Investigations" value="3" icon={AlertTriangle} color="#ef4444" />
    <DashboardCard title="Audit Summary" value="Clear" icon={Shield} color="#10b981" />
  </div>
);

const PolicymakerDashboard = ({ data }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
    <DashboardCard title="Crime Index" value="7.4/10" icon={Activity} color="#f59e0b" />
    <DashboardCard title="District Comparison" value="Sector 4 Highest" icon={Map} color="#ef4444" />
    <DashboardCard title="Forecast" value="Downward Trend" icon={TrendingUp} color="#10b981" />
    <DashboardCard title="Policy Recommendations" value="5 Available" icon={FileText} color="#3b82f6" />
    <DashboardCard title="Budget Impact" value="$1.2M Saved" icon={DollarSign} color="#10b981" />
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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

<<<<<<< Updated upstream
  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</div>;
  if (!data) return <div style={{ color: 'var(--accent-danger)' }}>{t('common.error')} connecting to VIKSHANA core systems.</div>;
=======
  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Intelligence Data...</div>;

  const role = user?.role || 'Viewer';

  const renderDashboard = () => {
    switch (role) {
      case 'Administrator': return <AdminDashboard data={data} />;
      case 'Investigator': return <InvestigatorDashboard data={data} />;
      case 'Analyst': return <AnalystDashboard data={data} />;
      case 'Supervisor': return <SupervisorDashboard data={data} />;
      case 'Policymaker': return <PolicymakerDashboard data={data} />;
      default: return <div style={{ color: 'var(--text-muted)' }}>No widgets available for {role}.</div>;
    }
  };
>>>>>>> Stashed changes

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
<<<<<<< Updated upstream
          <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>{t('dashboard.title', 'Command Center')}</h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>{t('dashboard.subtitle', 'Real-time intelligence and sector overview.')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <DashboardCard title={t('dashboard.activeCases', 'Total Active Cases')} value={data.stats.totalCases.toLocaleString()} icon={Shield} color="#3b82f6" />
        <DashboardCard title={t('dashboard.pendingReview', 'Open Investigations')} value={data.stats.openCases.toLocaleString()} icon={SearchIcon} color="#f59e0b" />
        <DashboardCard title="Today's FIRs" value={data.stats.todaysFIR} subtitle={data.stats.crimeTrend} icon={FileText} color="#ef4444" />
        <DashboardCard title={t('dashboard.criticalAlerts', 'Crime Rate Trend')} value={data.stats.crimeTrend} icon={TrendingUp} color={data.stats.crimeTrend.startsWith('-') ? '#10b981' : '#ef4444'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>{t('dashboard.criticalAlerts', 'Recent High-Priority Alerts')}</h3>
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
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>{t('dashboard.recentActivity', 'Live Activity Stream')}</h3>
          <p style={{ color: 'var(--text-muted)' }}>AI pattern matching initialized...</p>
=======
          <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-primary)' }}>Command Center</h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>Real-time intelligence tailored for {role}.</p>
>>>>>>> Stashed changes
        </div>
      </div>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
