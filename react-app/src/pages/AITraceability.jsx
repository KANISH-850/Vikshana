import React, { useState, useEffect } from 'react';
import { Download, Search, Activity, Users, FileText, Cpu, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/catalyst';
import { exportAILogsPDF } from '../utils/pdfExport';

export default function AITraceability() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/audit/ai-logs');
            if (response.success) {
                setLogs(response.data || []);
                setStats(response.stats || {});
            }
        } catch (error) {
            console.error('Failed to fetch AI logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!logs.length) return;
        exportAILogsPDF(logs);
    };

    const filteredLogs = logs.filter(log =>
        log.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.case_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const confidenceData = [
        { name: 'HIGH', value: stats?.highConfidence || 0, color: '#10b981' },
        { name: 'MEDIUM', value: stats?.mediumConfidence || 0, color: '#f59e0b' },
        { name: 'LOW', value: stats?.lowConfidence || 0, color: '#ef4444' }
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Cpu className="text-purple-400" />
                        AI Traceability
                    </h1>
                    <p className="text-slate-400">Monitor and audit all AI interactions for transparency.</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-colors"
                >
                    <Download size={18} /> Export PDF
                </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400"><Activity size={24} /></div>
                    <div><p className="text-sm text-slate-400">Total Queries</p><p className="text-2xl font-bold text-white">{stats?.totalQueries || 0}</p></div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400"><AlertTriangle size={24} /></div>
                    <div><p className="text-sm text-slate-400">High Confidence</p><p className="text-2xl font-bold text-white">{stats?.highConfidence || 0}</p></div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400"><Users size={24} /></div>
                    <div><p className="text-sm text-slate-400">Active Users</p><p className="text-2xl font-bold text-white">{[...new Set(logs.map(l => l.user_id))].length}</p></div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-orange-500/20 text-orange-400"><FileText size={24} /></div>
                    <div><p className="text-sm text-slate-400">Total Evidence Refs</p><p className="text-2xl font-bold text-white">
                        {logs.reduce((acc, l) => {
                            try { return acc + (JSON.parse(l.evidence_ids || '[]').length); } catch(e) { return acc; }
                        }, 0)}
                    </p></div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Confidence Distribution</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={confidenceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {confidenceData.map((entry, index) => <Cell key={`cell-\${index}`} fill={entry.color} />)}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity (Model: crm-di-glm47b)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={logs.slice(0, 10).reverse()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="user_name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                                <Bar dataKey="confidence" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden" id="ai-logs-table">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Interaction Log</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search prompts or cases..."
                            className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                                <th className="p-4 font-medium border-b border-slate-800">Timestamp</th>
                                <th className="p-4 font-medium border-b border-slate-800">User</th>
                                <th className="p-4 font-medium border-b border-slate-800">Prompt / Task</th>
                                <th className="p-4 font-medium border-b border-slate-800">Context (Case/Model)</th>
                                <th className="p-4 font-medium border-b border-slate-800">Confidence</th>
                                <th className="p-4 font-medium border-b border-slate-800 text-right">Evidence Linked</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-300">
                            {filteredLogs.map(log => (
                                <tr key={log.log_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 whitespace-nowrap text-slate-400">
                                        {new Date(log.generated_time).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-200">{log.user_name}</div>
                                        <div className="text-xs text-slate-500">{log.role}</div>
                                    </td>
                                    <td className="p-4 max-w-xs truncate" title={log.prompt}>
                                        {log.prompt}
                                    </td>
                                    <td className="p-4">
                                        <div className="text-indigo-400">{log.case_id}</div>
                                        <div className="text-xs text-slate-500">{log.model}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium \${
                                            log.confidence?.includes('HIGH') ? 'bg-emerald-500/10 text-emerald-400' :
                                            log.confidence?.includes('MEDIUM') ? 'bg-orange-500/10 text-orange-400' :
                                            'bg-slate-500/10 text-slate-400'
                                        }`}>
                                            {log.confidence}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {(() => {
                                            try {
                                                const evs = JSON.parse(log.evidence_ids || '[]');
                                                return evs.length > 0 ? (
                                                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                                        {evs.length} refs
                                                    </span>
                                                ) : <span className="text-slate-500">-</span>;
                                            } catch (e) { return <span className="text-slate-500">-</span>; }
                                        })()}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">
                                        No AI interactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
