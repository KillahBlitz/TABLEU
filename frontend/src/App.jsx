import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ParticleBackground } from './components/common/ParticleBackground';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthView } from './components/auth/AuthView';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { BacklogView } from './components/backlog/BacklogView';
import { SiteMapsContainer } from './components/sitemap/SiteMapsContainer';
import { KpiDashboard } from './components/kpis/KpiDashboard';
import { AttendanceDashboard } from './components/attendance/AttendanceDashboard';

const AppLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      {user && <Navbar />}
      <main className="main-content">{children}</main>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <ParticleBackground />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<AuthView />} />

            <Route
              path="/kanban"
              element={
                <ProtectedRoute>
                  <KanbanBoard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/backlog"
              element={
                <ProtectedRoute>
                  <BacklogView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sitemaps"
              element={
                <ProtectedRoute>
                  <SiteMapsContainer />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sitemap"
              element={
                <ProtectedRoute>
                  <SiteMapsContainer />
                </ProtectedRoute>
              }
            />

            <Route
              path="/kpis"
              element={
                <ProtectedRoute adminOnly={true}>
                  <KpiDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/attendance"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AttendanceDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/kanban" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
