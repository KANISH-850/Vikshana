import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './auth/ProtectedRoute';

// Auth Pages
import Login from './auth/Login';
import Signup from './auth/Signup';
import ForgotPassword from './auth/ForgotPassword';
import ConfirmPassword from './auth/ConfirmPassword';

// Components
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
  return (
    <AuthProvider>
      <AppProvider>
        <LanguageProvider>
          <Router basename="/app">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/confirm-password" element={<ConfirmPassword />} />

            {/* Protected Dashboard Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/investigate" element={<ProtectedRoute><DashboardLayout><InvestigationWorkspace /></DashboardLayout></ProtectedRoute>} />
            <Route path="/investigate/:caseId" element={<ProtectedRoute><DashboardLayout><InvestigationWorkspace /></DashboardLayout></ProtectedRoute>} />
            <Route path="/intelligence" element={<ProtectedRoute><DashboardLayout><Intelligence /></DashboardLayout></ProtectedRoute>} />
            <Route path="/relationships" element={<ProtectedRoute><DashboardLayout><RelationshipExplorer /></DashboardLayout></ProtectedRoute>} />
            <Route path="/timeline" element={<ProtectedRoute><DashboardLayout><Timeline /></DashboardLayout></ProtectedRoute>} />
            <Route path="/timeline/:caseId" element={<ProtectedRoute><DashboardLayout><Timeline /></DashboardLayout></ProtectedRoute>} />
            <Route path="/decision-support" element={<ProtectedRoute><DashboardLayout><InvestigatorDecisionSupport /></DashboardLayout></ProtectedRoute>} />
            <Route path="/evidence" element={<ProtectedRoute><DashboardLayout><EvidenceLedger /></DashboardLayout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AppProvider>
  </AuthProvider>
);
}

export default App;