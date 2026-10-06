import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const AdminLogin = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Safety: hard replace location so no cached path renders the form
      window.history.replaceState({}, '', '/login');
    }
  }, []);
  return <Navigate to="/login" replace />;
};

export default AdminLogin;
