import { useAuth } from "@/react-app/contexts/AuthContext";
import { useRole } from "@/react-app/contexts/RoleContext";
import { Navigate } from "react-router";
import { Loader2, Shield, AlertTriangle } from "lucide-react";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'doctor' | 'nurse';
  requireAuthorization?: boolean;
}

export default function RoleProtectedRoute({ 
  children, 
  requiredRole,
  requireAuthorization = true 
}: RoleProtectedRouteProps) {
  const { user, isPending } = useAuth();
  const { role, isAuthorized } = useRole();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4">
            <Loader2 className="w-12 h-12 text-purple-500" />
          </div>
          <p className="text-gray-600 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAuthorization && !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="card glow p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              Your email address is not authorized to access Curanova. Only authorized medical staff can use this system.
            </p>
            <div className="text-sm text-gray-500 space-y-2">
              <p><strong>For Doctors:</strong> Use format doctorname.01.doctor@gmail.com</p>
              <p><strong>For Nurses:</strong> Use format nursename.02.nurse@gmail.com</p>
            </div>
            <button
              onClick={() => window.location.href = '/api/logout'}
              className="mt-6 btn-secondary w-full"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="card glow p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-yellow-600 mb-4">Insufficient Permissions</h1>
            <p className="text-gray-600 mb-4">
              This feature is restricted to {requiredRole}s only.
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary w-full"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
