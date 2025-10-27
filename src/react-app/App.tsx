import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/react-app/contexts/AuthContext";
import { ThemeProvider } from "@/react-app/contexts/ThemeContext";
import { RoleProvider } from "@/react-app/contexts/RoleContext";
import LandingPage from "@/react-app/pages/Landing";
import LoginPage from "@/react-app/pages/Login";
import RoleSelectionPage from "@/react-app/pages/RoleSelection";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import DashboardPage from "@/react-app/pages/Dashboard";
import PatientDetailsPage from "@/react-app/pages/PatientDetails";
import PatientsPage from "@/react-app/pages/Patients";
import AddPatientPage from "@/react-app/pages/AddPatient";
import SimilarConditionsPage from "@/react-app/pages/SimilarConditions";
import PatientDashboardPage from "@/react-app/pages/PatientDashboard";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
import RoleProtectedRoute from "@/react-app/components/RoleProtectedRoute";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/role-selection" element={<RoleSelectionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute>
                    <DashboardPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute>
                    <PatientsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/add"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute>
                    <AddPatientPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute>
                    <PatientDetailsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/similar-conditions"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute requiredRole="doctor">
                    <SimilarConditionsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient-dashboard"
              element={<PatientDashboardPage />}
            />
          </Routes>
        </Router>
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
