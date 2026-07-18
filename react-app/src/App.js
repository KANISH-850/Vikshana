import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import InvestigationWorkspace from './pages/InvestigationWorkspace';
import RelationshipExplorer from './pages/RelationshipExplorer';
import EvidenceLedger from './pages/EvidenceLedger';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <Router>
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
          <Sidebar />
          
          {/* Main Content Area */}
          <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
            <Navbar />
            
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/investigate" element={<InvestigationWorkspace />} />
              <Route path="/investigate/:caseId" element={<InvestigationWorkspace />} />
              <Route path="/relationships" element={<RelationshipExplorer />} />
              <Route path="/evidence" element={<EvidenceLedger />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<h2>404 Not Found - Module under construction</h2>} />
            </Routes>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;