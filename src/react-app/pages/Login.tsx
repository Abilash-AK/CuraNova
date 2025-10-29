import { useAuth } from "@/react-app/contexts/AuthContext";
import { Navigate, Link } from "react-router";
import ThemeToggle from "@/react-app/components/ThemeToggle";
import { Stethoscope, Shield, Sparkles, UserCheck, Heart, ArrowRight, ArrowLeft, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function Login() {
  const { user, redirectToLogin, isFetching } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'nurse' | 'patient' | null>(null);
  const [mrnNumber, setMrnNumber] = useState('');
  const [dob, setDob] = useState('');
  const [patientLoginError, setPatientLoginError] = useState('');

  useEffect(() => {
    document.body.style.fontFamily = "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif";
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async () => {
    await redirectToLogin();
  };

  const handlePatientLogin = async () => {
    if (!mrnNumber.trim()) {
      setPatientLoginError('Please enter your Medical Record Number');
      return;
    }

    try {
      const response = await fetch('/api/patient-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mrn: mrnNumber.trim(), dob: dob.trim() }),
        credentials: 'include',
      });

      if (response.ok) {
        // Store patient session data in localStorage for demo purposes
        localStorage.setItem('patient-session', JSON.stringify({
          mrn: mrnNumber.trim(),
          loginTime: new Date().toISOString()
        }));
        localStorage.setItem('demo-user', JSON.stringify({ role: 'patient', mrn: mrnNumber.trim() }));
        localStorage.setItem('demo-session', 'patient-session-active');
        
        // Redirect to patient dashboard
        window.location.href = '/patient-dashboard';
      } else {
        const error = await response.json();
        setPatientLoginError(error.message || 'Invalid Medical Record Number');
      }
    } catch (error) {
      console.error('Failed to process patient login', error);
      setPatientLoginError('Login failed. Please check your Medical Record Number.');
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      {/* Navigation controls - positioned absolutely with proper z-index */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
        <Link 
          to="/"
          className="btn-ghost text-sm inline-flex items-center space-x-2 px-4 py-2 shadow-lg hover:shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/50 dark:border-slate-700/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
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
        <div className="text-center mb-8 lg:mb-12">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-6 animate-float">
            <Stethoscope className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold gradient-text mb-3 lg:mb-4">Welcome to CuraNova</h1>
          <p className="text-lg lg:text-xl text-secondary max-w-2xl mx-auto">Advanced AI-powered Electronic Medical Records system for healthcare professionals</p>
        </div>

        {!selectedRole ? (
          <>
            {/* Role Selection */}
            <div className="grid sm:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
              {/* Doctor Card */}
              <button
                onClick={() => setSelectedRole('doctor')}
                className="card glow hover:scale-105 transition-all duration-300 p-6 lg:p-8 text-left group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:scale-110 transition-transform">
                    <UserCheck className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-primary mb-3 lg:mb-4">For Doctors</h2>
                  <p className="text-secondary mb-4 lg:mb-6 text-sm lg:text-base">Full access to all features including AI insights and diagnostic tools</p>
                  
                  {/* Features */}
                  <div className="space-y-2 lg:space-y-3 mb-6 lg:mb-8 text-left">
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-blue-600" />
                      </div>
                      <span className="text-secondary">AI-powered diagnostic assistance</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                        <Shield className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-cyan-600" />
                      </div>
                      <span className="text-secondary">Similar patient case analysis</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Heart className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-green-600" />
                      </div>
                      <span className="text-secondary">Complete patient management</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-indigo-600 dark:text-indigo-400 font-medium">
                    <span>Continue as Doctor</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Nurse Card */}
              <button
                onClick={() => setSelectedRole('nurse')}
                className="card glow hover:scale-105 transition-all duration-300 p-6 lg:p-8 text-left group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-primary mb-3 lg:mb-4">For Nurses</h2>
                  <p className="text-secondary mb-4 lg:mb-6 text-sm lg:text-base">Essential patient care features for nursing staff</p>
                  
                  {/* Features */}
                  <div className="space-y-2 lg:space-y-3 mb-6 lg:mb-8 text-left">
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                        <Heart className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-pink-600" />
                      </div>
                      <span className="text-secondary">Patient records management</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                        <Shield className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-rose-600" />
                      </div>
                      <span className="text-secondary">Vital signs tracking</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-cyan-600" />
                      </div>
                      <span className="text-secondary">Lab results monitoring</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-pink-600 dark:text-pink-400 font-medium">
                    <span>Continue as Nurse</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Patient Card */}
              <button
                onClick={() => setSelectedRole('patient')}
                className="card glow hover:scale-105 transition-all duration-300 p-6 lg:p-8 text-left group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-primary mb-3 lg:mb-4">For Patients</h2>
                  <p className="text-secondary mb-4 lg:mb-6 text-sm lg:text-base">View your medical records and update personal information</p>
                  
                  {/* Features */}
                  <div className="space-y-2 lg:space-y-3 mb-6 lg:mb-8 text-left">
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Heart className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-green-600" />
                      </div>
                      <span className="text-secondary">View medical records</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <Shield className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-emerald-600" />
                      </div>
                      <span className="text-secondary">Access lab results</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs lg:text-sm">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-teal-600" />
                      </div>
                      <span className="text-secondary">Update personal details</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400 font-medium">
                    <span>Continue as Patient</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            </div>

            {/* Contact Info */}
            <div className="text-center animate-fade-in">
              <p className="text-sm text-muted">
                Need access? Contact your hospital administrator or IT department.
              </p>
            </div>
          </>
        ) : (
          <>
            {selectedRole === 'patient' ? (
              /* Patient Login Section */
              <div className="card glow p-6 lg:p-8 text-center max-w-md mx-auto">
                <div className="mb-6">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-primary mb-2">
                    Patient Portal Access
                  </h3>
                  <p className="text-secondary text-sm lg:text-base">
                    Enter your Medical Record Number to access your health records
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="text-left">
                    <label htmlFor="mrn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Medical Record Number (MRN)
                    </label>
                    <input
                      id="mrn"
                      type="text"
                      value={mrnNumber}
                      onChange={(e) => {
                        setMrnNumber(e.target.value);
                        setPatientLoginError('');
                      }}
                      placeholder="Enter your MRN"
                      className="w-full px-4 py-3 bg-white dark:bg-white text-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div className="text-left">
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-white text-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  
                  {patientLoginError && (
                    <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      {patientLoginError}
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePatientLogin}
                  className="w-full btn-primary text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 inline-flex items-center justify-center space-x-3 mb-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <User className="w-5 h-5" />
                  <span>Access Patient Portal</span>
                </button>

                <div className="text-xs lg:text-sm text-muted bg-gray-50 dark:bg-gray-800/50 p-3 lg:p-4 rounded-lg mb-4">
                  <strong>For demo purposes:</strong><br />
                  Use any MRN from existing patient records (e.g., MRN001, MRN002, etc.)
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors inline-flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to role selection</span>
                  </button>
                </div>

                <div className="mt-4 lg:mt-6">
                  <p className="text-xs text-muted">
                    By accessing the patient portal, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            ) : (
              /* Healthcare Professional Login Section */
              <div className="card glow p-6 lg:p-8 text-center max-w-md mx-auto">
                <div className="mb-6">
                  <div className={`w-12 h-12 lg:w-16 lg:h-16 ${
                    selectedRole === 'doctor' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                      : 'bg-gradient-to-r from-pink-500 to-rose-600'
                  } rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    {selectedRole === 'doctor' ? (
                      <UserCheck className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                    ) : (
                      <Heart className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                    )}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-primary mb-2">
                    Sign in as {selectedRole === 'doctor' ? 'Doctor' : 'Nurse'}
                  </h3>
                  <p className="text-secondary text-sm lg:text-base">
                    Choose your login method to access CuraNova
                  </p>
                </div>

              
              
              <button
                onClick={handleLogin}
                disabled={isFetching}
                className="w-full btn-primary text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 inline-flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
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
                    <span>Google OAuth Login</span>
                  </>
                )}
              </button>

              

              <div className="flex items-center justify-center">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors inline-flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to role selection</span>
                </button>
              </div>

              <div className="mt-4 lg:mt-6">
                <p className="text-xs text-muted">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
