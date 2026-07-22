import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { 
    BookOpen, Briefcase, BrainCircuit, Scale, Filter, Loader2, 
    AlertCircle, ArrowUpRight, ArrowDownRight, Map
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, Line,
    PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import api from '../services/api';
import SociologicalAssistant from '../components/sociological/SociologicalAssistant';
import PolicyRecommendations from '../components/sociological/PolicyRecommendations';
import MigrationUrbanizationAnalytics from '../components/sociological/MigrationUrbanizationAnalytics';
import { AuthContext } from '../context/AuthContext';


const SociologicalInsights = () => {
    const { user } = useContext(AuthContext);
    const isSenior = user?.role === 'Senior Investigator' || user?.role === 'Admin';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [regionFilter, setRegionFilter] = useState('All');
    const [timeframe, setTimeframe] = useState('6M');

    // Data States
    const [overviewData, setOverviewData] = useState(null);
    const [demographicsData, setDemographicsData] = useState(null);
    const [socialRiskData, setSocialRiskData] = useState(null);
    const [districtData, setDistrictData] = useState(null);
    const [correlationsData, setCorrelationsData] = useState(null);

    const abortRef = useRef(null);

    // Fetch all sociological data concurrently; cancel on unmount/filter change
    useEffect(() => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const signal = abortRef.current.signal;

        setLoading(true);
        setError(null);

        const cfg = { signal };
        Promise.all([
            api.get('/sociological/overview',    cfg),
            api.get('/sociological/demographics', cfg),
            api.get('/sociological/social-risk',  cfg),
            api.get('/sociological/districts',    cfg),
            api.get('/sociological/correlations', cfg),
        ])
        .then(([overviewRes, demoRes, riskRes, districtRes, corrRes]) => {
            if (overviewRes.data.success)  setOverviewData(overviewRes.data.data);
            if (demoRes.data.success)      setDemographicsData(demoRes.data.data);
            if (riskRes.data.success)      setSocialRiskData(riskRes.data.data);
            if (districtRes.data.success)  setDistrictData(districtRes.data.data);
            if (corrRes.data.success)      setCorrelationsData(corrRes.data.data);
            setLoading(false);
        })
        .catch(err => {
            if (err.name === 'CanceledError' || err.name === 'AbortError') return;
            console.error('[SociologicalInsights] fetch failed:', err);
            setError('Failed to fetch sociological data. Please try again.');
            setLoading(false);
        });

        return () => abortRef.current?.abort();
    }, [regionFilter, timeframe]);

    // Stable tooltip renderer — avoids re-creating on every render
    const renderTooltip = useCallback((props) => (
        <RechartsTooltip
            {...props}
            contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--text-primary)' }}
        />
    ), []);

    const handleRegionChange  = useCallback(e => setRegionFilter(e.target.value), []);
    const handleTimeframeChange = useCallback(e => setTimeframe(e.target.value), []);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={40} style={{ marginBottom: '16px', color: 'var(--accent-primary)' }} />
                <h3>Analyzing Socio-Economic Patterns...</h3>
                <p>Generating causal inference models</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-primary)', border: '1px solid var(--accent-danger)' }}>
                <AlertCircle size={48} color="var(--accent-danger)" style={{ margin: '0 auto 16px' }} />
                <h3>Analysis Engine Error</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
                <button 
                    onClick={() => setRegionFilter('All')} 
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '6px', marginTop: '16px', cursor: 'pointer' }}
                >
                    Retry Analysis
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Filters Bar */}
            <div role="search" aria-label="Analysis filters" className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Filter size={18} color="var(--text-secondary)" aria-hidden="true" />
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Analysis Filters</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <label htmlFor="region-filter" className="sr-only">Sector filter</label>
                    <select
                        id="region-filter"
                        value={regionFilter}
                        onChange={handleRegionChange}
                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '6px', outline: 'none' }}
                    >
                        <option value="All">All Sectors</option>
                        <option value="Sector 1">Sector 1</option>
                        <option value="Sector 3">Sector 3</option>
                    </select>
                    <label htmlFor="timeframe-filter" className="sr-only">Timeframe filter</label>
                    <select
                        id="timeframe-filter"
                        value={timeframe}
                        onChange={handleTimeframeChange}
                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '6px', outline: 'none' }}
                    >
                        <option value="1M">Last Month</option>
                        <option value="6M">Last 6 Months</option>
                        <option value="1Y">Last Year</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                            <Briefcase color="var(--accent-danger)" size={20} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: overviewData?.kpis?.unemployment?.trend > 0 ? 'var(--accent-danger)' : 'var(--accent-success)', fontSize: '12px', fontWeight: '600' }}>
                            {overviewData?.kpis?.unemployment?.trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(overviewData?.kpis?.unemployment?.trend || 0)}%
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{overviewData?.kpis?.unemployment?.value}%</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Youth Unemployment Rate</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '8px' }}>
                            <BookOpen color="var(--accent-warning)" size={20} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>
                            Stable
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{overviewData?.kpis?.educationGap?.value}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Education Disparity Index</div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px' }}>
                            <Scale color="var(--accent-success)" size={20} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: overviewData?.kpis?.recidivismRisk?.trend < 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontSize: '12px', fontWeight: '600' }}>
                            {overviewData?.kpis?.recidivismRisk?.trend < 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />} {Math.abs(overviewData?.kpis?.recidivismRisk?.trend || 0)}%
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{overviewData?.kpis?.recidivismRisk?.value}%</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Recidivism Risk Score</div>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginTop: '10px', marginBottom: '0' }}>Demographic Analysis</h2>
            
            {/* Demographics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>Age Distribution</h3>
                    <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={demographicsData?.ageDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="age" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                                {renderTooltip()}
                                <Bar dataKey="count" name="Incidents" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>Gender Breakdown</h3>
                    <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={demographicsData?.genderBreakdown || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                    {(demographicsData?.genderBreakdown || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#ec4899', '#10b981'][index % 3]} />
                                    ))}
                                </Pie>
                                {renderTooltip()}
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>Urban vs Rural Split</h3>
                    <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={demographicsData?.urbanRuralSplit || []} cx="50%" cy="50%" innerRadius={0} outerRadius={90} paddingAngle={2} dataKey="value">
                                    {(demographicsData?.urbanRuralSplit || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#f59e0b', '#8b5cf6', '#10b981'][index % 3]} />
                                    ))}
                                </Pie>
                                {renderTooltip()}
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginTop: '10px', marginBottom: '0' }}>Economic Indicators</h2>

            {/* Economics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>Income Bracket Correlation</h3>
                    <div style={{ height: '280px', width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={socialRiskData?.incomeCorrelation || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorProp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-warning)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--accent-warning)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorViolent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-danger)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--accent-danger)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="bracket" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                                {renderTooltip()}
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Area type="monotone" dataKey="propertyCrime" name="Property Crime" stroke="var(--accent-warning)" fill="url(#colorProp)" />
                                <Area type="monotone" dataKey="violentCrime" name="Violent Crime" stroke="var(--accent-danger)" fill="url(#colorViolent)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>Education Level Breakdown</h3>
                    <div style={{ height: '280px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={socialRiskData?.educationBreakdown || []} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                                <YAxis dataKey="level" type="category" stroke="var(--text-secondary)" fontSize={12} tickLine={false} width={80} />
                                {renderTooltip()}
                                <Bar dataKey="count" name="Individuals Involved" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginTop: '10px', marginBottom: '0' }}>Risk Trends & Correlations</h2>
            
            {/* Expanded Correlation Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>Socio-Economic Factors vs Crime Rate</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={correlationsData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="region" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                                {renderTooltip()}
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Bar dataKey="educationGap" name="Education Gap" fill="var(--accent-warning)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="unemployment" name="Unemployment" fill="var(--accent-danger)" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="crimeRate" name="Crime Rate" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>Intervention Impact on Recidivism</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={socialRiskData?.recidivismTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRecidivism" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-danger)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--accent-danger)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorIntervention" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-success)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--accent-success)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                                {renderTooltip()}
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Area type="monotone" dataKey="recidivism" name="Recidivism Trends" stroke="var(--accent-danger)" fillOpacity={1} fill="url(#colorRecidivism)" />
                                <Area type="monotone" dataKey="intervention" name="Community Programs" stroke="var(--accent-success)" fillOpacity={1} fill="url(#colorIntervention)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginTop: '10px', marginBottom: '0' }}>Geographic & Structural</h2>

            {/* Geography Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>District Threat Profile</h3>
                    <div style={{ height: '320px', width: '100%' }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={districtData || []}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                {renderTooltip()}
                                <Radar name="Central District" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.4} />
                                <Radar name="North District" dataKey="B" stroke="var(--accent-danger)" fill="var(--accent-danger)" fillOpacity={0.4} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>Sociological Heatmap (Preview)</h3>
                    <div style={{ 
                        flex: 1, 
                        minHeight: '280px',
                        borderRadius: '8px', 
                        background: 'linear-gradient(45deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%)',
                        border: '1px dashed var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Fake heatmap blocks */}
                        <div style={{ position: 'absolute', top: '20%', left: '30%', width: '40px', height: '40px', background: 'var(--accent-danger)', borderRadius: '50%', filter: 'blur(20px)', opacity: 0.6 }}></div>
                        <div style={{ position: 'absolute', bottom: '30%', right: '20%', width: '60px', height: '60px', background: 'var(--accent-warning)', borderRadius: '50%', filter: 'blur(25px)', opacity: 0.5 }}></div>
                        
                        <Map size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Geospatial Integration Pending</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px', textAlign: 'center', maxWidth: '250px' }}>
                            Full heatmap rendering requires connecting the mapping service in the next deployment phase.
                        </span>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginTop: '10px', marginBottom: '0' }}>AI Synthesis</h2>

            {/* AI Insights & Policy Recommendations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BrainCircuit color="var(--accent-primary)" size={20} />
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>AI Sociological Insights</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(overviewData?.insights || []).map((insight, idx) => (
                            <div key={idx} style={{ 
                                padding: '14px', 
                                background: 'var(--bg-tertiary)', 
                                borderLeft: '3px solid var(--accent-primary)',
                                borderRadius: '6px',
                                fontSize: '13.5px',
                                color: 'var(--text-primary)',
                                lineHeight: '1.5'
                            }}>
                                {insight}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginTop: '10px', marginBottom: '0' }}>Migration, Urbanization & Social Correlations</h2>

            <MigrationUrbanizationAnalytics />

            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginTop: '10px', marginBottom: '0' }}>Policy Recommendations</h2>

            <PolicyRecommendations />

            <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginTop: '10px', marginBottom: '0' }}>AI Sociological Assistant</h2>

            <SociologicalAssistant />

        </div>
    );
};

export default SociologicalInsights;
