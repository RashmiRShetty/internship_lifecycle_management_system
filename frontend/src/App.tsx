import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { GlobalAlertToast } from './components/GlobalAlertToast';
import { jwtDecode } from 'jwt-decode';

interface CustomJwtPayload {
  role: string;
}

// Protected Route Component for generic roles
const roleLanding: Record<string, string> = {
  STUDENT: '/student',
  FACULTY: '/faculty',
  ADMIN: '/admin',
  SUPER_ADMIN: '/admin',
};

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<CustomJwtPayload>(token);
    if (allowedRoles.includes(decoded.role)) {
      return <>{children}</>;
    }

    const landing = roleLanding[decoded.role] || '/login';
    return <Navigate to={landing} replace />;
  } catch {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <GlobalAlertToast />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Student Routes */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* Faculty Routes */}
        <Route path="/faculty/*" element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <FacultyDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
