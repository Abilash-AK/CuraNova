import { useAuth } from "@/react-app/contexts/AuthContext";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isFetching } = useAuth();
  
  // Check for demo session
  const demoUser = localStorage.getItem('demo-user');
  const demoSession = localStorage.getItem('demo-session');
  const hasValidSession = user || (demoUser && demoSession);

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!hasValidSession) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
