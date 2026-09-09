import { Navigate } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth } from '../services/authContext';

export default function ProtectedRoute({ children }: { children: ReactNode }): React.JSX.Element {
  const { usuario } = useAuth();
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
