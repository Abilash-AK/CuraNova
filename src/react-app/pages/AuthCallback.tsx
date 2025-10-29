import { useEffect, useState } from "react";
import { useAuth } from "@/react-app/contexts/AuthContext";
import { Navigate } from "react-router";
import { Stethoscope, CheckCircle, AlertCircle } from "lucide-react";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken, user, isPending } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
      return;
    }
    
    if (code && !user && !isPending) {
      console.log("Exchanging code for session token...");
      exchangeCodeForSessionToken(code, state).catch((err) => {
        console.error("Authentication error:", err);
        setError("Failed to complete authentication. Please try again.");
      });
    }
  }, [exchangeCodeForSessionToken, user, isPending]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        {/* Dynamic animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-element floating-element-1"></div>
          <div className="floating-element floating-element-2"></div>
        </div>

        <div className="relative text-center">
          <div className="card glow animate-fade-in max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-xl font-bold text-primary mb-2">Authentication Error</h2>
            <p className="text-secondary mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      {/* Dynamic animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element floating-element-1"></div>
        <div className="floating-element floating-element-2"></div>
      </div>

      <div className="relative text-center">
        <div className="card glow animate-fade-in max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-primary mb-2">Completing Sign In</h2>
              <p className="text-secondary">Setting up your Curanova workspace...</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-primary mb-2">Authentication Successful</h2>
              <p className="text-secondary">Redirecting to your dashboard...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
