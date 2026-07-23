import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AutoTranslator from './components/AutoTranslator';

// Auth Pages
import Login from './auth/Login';
import Signup from './auth/Signup';
import ForgotPassword from './auth/ForgotPassword';
import ConfirmPassword from './auth/ConfirmPassword';

// Components & Pages
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import InvestigationWorkspace from './pages/InvestigationWorkspace';
import RelationshipExplorer from './pages/RelationshipExplorer';
import EvidenceLedger from './pages/EvidenceLedger';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import Intelligence from './pages/Intelligence';
import Timeline from './pages/Timeline';
import InvestigatorDecisionSupport from './pages/InvestigatorDecisionSupport';
import AuditLogs from './pages/AuditLogs';
import AITraceability from './pages/AITraceability';
import DataExplorer from './pages/DataExplorer';
import FIRNarrativeUnderstanding from './pages/FIRNarrativeUnderstanding';
import EvidenceIntelligence from './pages/EvidenceIntelligence';

const DashboardLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
    <Sidebar />
    {/* Main Content Area */}
    <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
      <Navbar />
      {children}
    </div>
  </div>
);

function App() {
  const ALL_ROLES = ['Administrator', 'Investigator', 'Analyst', 'Supervisor', 'Policymaker', 'Viewer'];
  const INVESTIGATOR_ROLES = ['Administrator', 'Investigator', 'Supervisor'];
  const ANALYST_ROLES = ['Administrator', 'Investigator', 'Analyst', 'Supervisor', 'Policymaker'];
  const RELATIONSHIP_ROLES = ['Administrator', 'Investigator', 'Analyst', 'Supervisor'];
  const ADMIN_ROLES = ['Administrator'];
  const AUDIT_ROLES = ['Administrator', 'Supervisor'];

  return (
    <AuthProvider>
      <AppProvider>
        <LanguageProvider>
          <AutoTranslator />
          <Router basename="/app">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/confirm-password" element={<ConfirmPassword />} />

              {/* Protected Dashboard Routes with Strict RBAC Role Guarding */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={ALL_ROLES}>
                    <DashboardLayout><Dashboard /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/investigate"
                element={
                  <ProtectedRoute allowedRoles={INVESTIGATOR_ROLES}>
                    <DashboardLayout><InvestigationWorkspace /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/investigate/:caseId"
                element={
                  <ProtectedRoute allowedRoles={INVESTIGATOR_ROLES}>
                    <DashboardLayout><InvestigationWorkspace /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/intelligence"
                element={
                  <ProtectedRoute allowedRoles={ALL_ROLES}>
                    <DashboardLayout><Intelligence /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/relationships"
                element={
                  <ProtectedRoute allowedRoles={RELATIONSHIP_ROLES}>
                    <DashboardLayout><RelationshipExplorer /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/timeline"
                element={
                  <ProtectedRoute allowedRoles={ANALYST_ROLES}>
                    <DashboardLayout><Timeline /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/timeline/:caseId"
                element={
                  <ProtectedRoute allowedRoles={ANALYST_ROLES}>
                    <DashboardLayout><Timeline /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/decision-support"
                element={
                  <ProtectedRoute allowedRoles={INVESTIGATOR_ROLES}>
                    <DashboardLayout><InvestigatorDecisionSupport /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/evidence"
                element={
                  <ProtectedRoute allowedRoles={INVESTIGATOR_ROLES}>
                    <DashboardLayout><EvidenceLedger /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={ALL_ROLES}>
                    <DashboardLayout><Reports /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                    <DashboardLayout><Settings /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={AUDIT_ROLES}>
                    <DashboardLayout><AuditLogs /></DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ai-logs"
                element={
                  <ProtectedRoute allowedRoles={AUDIT_ROLES}>
                    <DashboardLayout><AITraceability /></DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/data-explorer"
                element={
                  <ProtectedRoute allowedRoles={ALL_ROLES}>
                    <DashboardLayout><DataExplorer /></DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/fir-intelligence"
                element={
                  <ProtectedRoute allowedRoles={INVESTIGATOR_ROLES}>
                    <DashboardLayout><FIRNarrativeUnderstanding /></DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/evidence-intelligence"
                element={
                  <ProtectedRoute allowedRoles={ALL_ROLES}>
                    <DashboardLayout><EvidenceIntelligence /></DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;