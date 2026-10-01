import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { PanelLayout } from '@/pages/dashboard/PanelLayout';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registro" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/panel" element={<PanelLayout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}