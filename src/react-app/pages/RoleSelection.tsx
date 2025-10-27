import { useAuth } from "@/react-app/contexts/AuthContext";
import { Navigate, Link } from "react-router";
import ThemeToggle from "@/react-app/components/ThemeToggle";
import { Stethoscope, UserCheck, Heart, Shield, Sparkles } from "lucide-react";
import { useEffect } from "react";

export default function RoleSelection() {
  const { user, redirectToLogin, isFetching } = useAuth();

  useEffect(() => {
    document.body.style.fontFamily = "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif";
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async () => {
    await redirectToLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      {/* Theme toggle - positioned absolutely */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      
      {/* Dynamic animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element floating-element-1"></div>
        <div className="floating-element floating-element-2"></div>
        <div className="floating-element floating-element-3"></div>
      </div>

      <div className="relative max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">Welcome to Curanova</h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">Advanced AI-powered Electronic Medical Records system for healthcare professionals</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Doctor Card */}
          <div className="card glow hover:scale-105 transition-all duration-300 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4">For Doctors</h2>
              <p className="text-secondary mb-6">Full access to all features including AI insights and diagnostic tools</p>
              
              {/* Features */}
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-secondary">AI-powered diagnostic assistance</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Shield className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-secondary">Similar patient case analysis</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Heart className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-secondary">Complete patient management</span>
                </div>
              </div>
              
              <div className="text-xs text-muted bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <strong>Email format:</strong> doctorname.01.doctor@gmail.com
              </div>
            </div>
          </div>

          {/* Nurse Card */}
          <div className="card glow hover:scale-105 transition-all duration-300 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4">For Nurses</h2>
              <p className="text-secondary mb-6">Essential patient care features for nursing staff</p>
              
              {/* Features */}
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-6 h-6 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                    <Heart className="w-3 h-3 text-pink-600" />
                  </div>
                  <span className="text-secondary">Patient records management</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-6 h-6 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                    <Shield className="w-3 h-3 text-rose-600" />
                  </div>
                  <span className="text-secondary">Vital signs tracking</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-secondary">Lab results monitoring</span>
                </div>
              </div>
              
              <div className="text-xs text-muted bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
                <strong>Email format:</strong> nursename.02.nurse@gmail.com
              </div>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="card glow p-8 text-center">
          <h3 className="text-xl font-semibold text-primary mb-4">Ready to get started?</h3>
          <p className="text-secondary mb-6">Sign in with your authorized Google account to access Curanova</p>
          
          <button
            onClick={handleLogin}
            disabled={isFetching}
            className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="mt-6">
            <p className="text-xs text-muted">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-muted mb-4">
            Need access? Contact your hospital administrator or IT department.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
