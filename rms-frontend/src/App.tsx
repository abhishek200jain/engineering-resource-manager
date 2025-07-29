import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Login } from '@/pages/Login';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import NotAuthorized from './pages/NotAuthorized';
import Layout from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import Profile from './pages/Profile';
import Projects from './components/Projects';
import Assignments from './components/Assignments';
import MyAssignments from './components/MyAssignments';
import Timeline from './components/Timeline';
import SkillGapAnalysis from './components/SkillGapAnalysis';

// Manager-only route wrapper
function ManagerOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'manager') {
    return <NotAuthorized />;
  }
  return <>{children}</>;
}

// Component to conditionally render Assignments or MyAssignments based on role
function AssignmentsWrapper() {
  const { user } = useAuth();
  if (user?.role === 'engineer') {
    return <MyAssignments />;
  }
  return <Assignments />;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="" element={<Dashboard />} />
                {/* Manager-only routes */}
                <Route path="projects" element={
                  <ManagerOnlyRoute>
                    <Projects />
                  </ManagerOnlyRoute>
                } />
                <Route path="skill-gaps" element={
                  <ManagerOnlyRoute>
                    <SkillGapAnalysis />
                  </ManagerOnlyRoute>
                } />
                {/* Role-based assignment route */}
                <Route path="assignments" element={<AssignmentsWrapper />} />
                {/* Shared routes */}
                <Route path="timeline" element={<Timeline />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<NotAuthorized />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default App;
