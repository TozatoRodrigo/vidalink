import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AccessPage } from './pages/AccessPage';
import { ScannerPage } from './pages/ScannerPage';
import { PatientTimelinePage } from './pages/PatientTimelinePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/access" element={<AccessPage />} />
          <Route path="/access/:token" element={<PatientTimelinePage />} />
          <Route path="/scanner" element={<ScannerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 