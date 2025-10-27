import { Link } from "react-router";
import { useAuth } from "@/react-app/contexts/AuthContext";
import ThemeToggle from "@/react-app/components/ThemeToggle";
import { 
  Stethoscope, 
  Brain, 
  Shield, 
  Activity, 
  Users, 
  TrendingUp,
  ChevronRight,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Globe,
  Zap,
  Heart
} from "lucide-react";
import { useEffect } from "react";

export default function Landing() {
  const { user } = useAuth();

  useEffect(() => {
    document.body.style.fontFamily = "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif";
  }, []);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float glow-intense">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-6">Welcome back to CuraNova</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">Ready to continue your medical practice?</p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4">
            <span>Go to Dashboard</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Enhanced dynamic animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-element floating-element-1"></div>
          <div className="floating-element floating-element-2"></div>
          <div className="floating-element floating-element-3"></div>
          
          {/* Additional floating elements for more elegance */}
          <div className="absolute w-64 h-64 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl animate-float top-20 right-20" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-48 h-48 bg-gradient-to-r from-emerald-300/20 to-teal-300/20 dark:from-emerald-600/10 dark:to-teal-600/10 rounded-full blur-3xl animate-float-slow bottom-32 left-32" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center glow">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">CuraNova</h1>
                <p className="text-sm text-muted font-medium">Smart AI EMR Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/login" className="btn-secondary text-sm font-semibold px-6 py-3">
                Login to Portal
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-5xl mx-auto">
            
            
            <h1 className="text-7xl lg:text-8xl font-bold mb-8 animate-fade-in leading-tight" style={{ animationDelay: '0.2s' }}>
              The Future of 
              <span className="gradient-text block mt-2">Healthcare Records</span>
            </h1>
            
            <p className="text-2xl text-secondary mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
              CuraNova revolutionizes medical practice with AI-powered insights, 
              intelligent diagnostics, and seamless patient management for superior healthcare outcomes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Link to="/login" className="btn-primary inline-flex items-center space-x-3 text-xl px-10 py-5 shadow-2xl hover:shadow-3xl">
                <Zap className="w-6 h-6" />
                <span>Start Your Practice</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
              
            </div>

            {/* Stats section */}
            <div className="flex justify-center mt-20 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
                <div className="text-secondary font-medium">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-4 py-2 rounded-full border border-indigo-200/50 dark:border-indigo-700/50 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Revolutionary Technology</span>
            </div>
            <h2 className="text-5xl font-bold gradient-text mb-6">
              Intelligent Healthcare Solutions
            </h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              Experience the next generation of EMR with AI-driven insights, predictive analytics, and seamless workflows designed for modern healthcare
            </p>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10">
            <div className="card card-hover animate-slide-up text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 glow">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">AI-Powered Insights</h3>
              <p className="text-secondary leading-relaxed text-lg mb-6">
                Get intelligent summaries, risk assessments, and treatment recommendations powered by advanced AI algorithms
              </p>
              <div className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-semibold">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="card card-hover animate-slide-up text-center group" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 glow">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Smart Diagnostics</h3>
              <p className="text-secondary leading-relaxed text-lg mb-6">
                Receive differential diagnosis suggestions, lab recommendations, and evidence-based treatment plans
              </p>
              <div className="inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="card card-hover animate-slide-up text-center group" style={{ animationDelay: '0.4s' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 glow">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Secure & Compliant</h3>
              <p className="text-secondary leading-relaxed text-lg mb-6">
                Enterprise-grade security with HIPAA compliance and role-based access controls for peace of mind
              </p>
              <div className="inline-flex items-center text-green-600 dark:text-green-400 font-semibold">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="card card-hover animate-slide-up text-center group" style={{ animationDelay: '0.6s' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 glow">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Patient Management</h3>
              <p className="text-secondary leading-relaxed text-lg mb-6">
                Comprehensive patient records with intelligent search, history tracking, and family management
              </p>
              <div className="inline-flex items-center text-orange-600 dark:text-orange-400 font-semibold">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="card card-hover animate-slide-up text-center group" style={{ animationDelay: '0.8s' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 glow">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Health Analytics</h3>
              <p className="text-secondary leading-relaxed text-lg mb-6">
                Visualize patient health metrics with animated charts and AI-driven pattern detection
              </p>
              <div className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="card card-hover animate-slide-up text-center group" style={{ animationDelay: '1s' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 glow">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Global Access</h3>
              <p className="text-secondary leading-relaxed text-lg mb-6">
                Cloud-based platform accessible anywhere with real-time synchronization and collaboration
              </p>
              <div className="inline-flex items-center text-violet-600 dark:text-violet-400 font-semibold">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* CTA Section */}
      <div className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="card glow-intense animate-fade-in p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5"></div>
            
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
                <Heart className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-5xl font-bold gradient-text mb-8">
                Ready to Transform Healthcare?
              </h2>
              <p className="text-2xl text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of healthcare professionals already using CuraNova to deliver 
                better patient outcomes with AI-powered medical intelligence.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link to="/login" className="btn-primary inline-flex items-center space-x-3 text-xl px-10 py-5 shadow-2xl">
                  <Zap className="w-6 h-6" />
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-6 h-6" />
                </Link>
                <div className="text-center">
                  <div className="text-sm text-muted mb-1">No credit card required</div>
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>30-day free trial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/20 dark:border-gray-700/20 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text">CuraNova</span>
                <p className="text-sm text-muted">Smart AI EMR Platform</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-muted mb-2">
                © 2024 CuraNova. Revolutionizing healthcare with AI.
              </p>
              <div className="flex items-center space-x-6 text-sm text-muted">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
