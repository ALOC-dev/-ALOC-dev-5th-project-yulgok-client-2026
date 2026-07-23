import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { canAccessCertifiedRoutes } from './serviceFlow.js';

function CertifiedRoute() {
  const location = useLocation();
  const { currentUser } = useAuth();

  if (!canAccessCertifiedRoutes(currentUser)) {
    return <Navigate to="/certification" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default CertifiedRoute;
