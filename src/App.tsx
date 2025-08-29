import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Builder from './pages/Builder';
import Dashboard from './pages/Dashboard';
import Preview from './pages/Preview';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/builder/:pageId" element={<Builder />} />
          <Route path="/preview/:pageId" element={<Preview />} />
          <Route path="/analytics/:pageId" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
