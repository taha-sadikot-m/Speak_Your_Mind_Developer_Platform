import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './services/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuestionSets from './pages/QuestionSets';
import SetDetail from './pages/SetDetail';
import APIKeys from './pages/APIKeys';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import ProgressReports from './pages/ProgressReports';
import Docs from './pages/Docs';
import Sandbox from './pages/Sandbox';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/sets" element={<ProtectedRoute><QuestionSets /></ProtectedRoute>} />
      <Route path="/sets/:id" element={<ProtectedRoute><SetDetail /></ProtectedRoute>} />
      <Route path="/api-keys" element={<ProtectedRoute><APIKeys /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
      <Route path="/sessions/:roomId" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
      <Route path="/progress-reports" element={<ProtectedRoute><ProgressReports /></ProtectedRoute>} />
      <Route path="/docs" element={<ProtectedRoute><Docs /></ProtectedRoute>} />
      <Route path="/sandbox" element={<ProtectedRoute><Sandbox /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
