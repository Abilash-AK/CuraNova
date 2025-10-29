import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { User, FileText, Phone, Mail, ArrowLeft, AlertCircle, Activity, TestTube, Sparkles } from "lucide-react";
import ThemeToggle from "@/react-app/components/ThemeToggle";
import PatientHealthSummaryModal from "@/react-app/components/PatientHealthSummaryModal";
import { useRole } from "@/react-app/contexts/RoleContext";
import type { LabResult, MedicalRecord, PatientWithRecords } from "@/shared/types";

type PatientData = PatientWithRecords & {
  medical_records: MedicalRecord[];
  lab_results: LabResult[];
};

interface PatientSession {
  mrn: string;
  loginTime?: string;
}

export default function PatientDashboard() {
  const { role, isPatient } = useRole();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHealthSummary, setShowHealthSummary] = useState(false);

  useEffect(() => {
    document.body.style.fontFamily = "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif";
    fetchPatientData();
  }, []);

  // Check if user is a patient, if not redirect
  if (role !== 'patient' && !isPatient) {
    return <Navigate to="/login" replace />;
  }

  const fetchPatientData = async () => {
    try {
      const patientSession = localStorage.getItem('patient-session');
      if (!patientSession) {
        setError('No active patient session');
        return;
      }

      const session = JSON.parse(patientSession) as PatientSession;
      if (!session?.mrn) {
        setError('Invalid patient session');
        return;
      }

      const response = await fetch(`/api/patient-data/${session.mrn}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const responseData = (await response.json()) as PatientWithRecords;
        const normalizedData: PatientData = {
          ...responseData,
          medical_records: responseData.medical_records ?? [],
          lab_results: responseData.lab_results ?? [],
        };
        setPatientData(normalizedData);
      } else {
        setError('Failed to load patient data');
      }
    } catch (error) {
      console.error('Error loading patient data', error);
      setError('Error loading patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('patient-session');
    localStorage.removeItem('demo-user');
    localStorage.removeItem('demo-session');
    window.location.href = '/';
  };

  const calculateAge = (birthDate: string) => {
    return new Date().getFullYear() - new Date(birthDate).getFullYear();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Unable to access patient data'}</p>
          <Link to="/login" className="btn-primary">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Patient Portal</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {patientData.first_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Information Card */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
              </div>

              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {patientData.first_name} {patientData.last_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">MRN: {patientData.medical_record_number}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Age</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {patientData.date_of_birth ? calculateAge(patientData.date_of_birth) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Gender</span>
                    <p className="font-medium text-gray-900 dark:text-white">{patientData.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Blood Type</span>
                    <p className="font-medium text-gray-900 dark:text-white">{patientData.blood_type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Doctor</span>
                    <p className="font-medium text-gray-900 dark:text-white">{patientData.current_doctor_name || 'N/A'}</p>
                  </div>
                </div>

                {patientData.allergies && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900 dark:text-red-300">Allergies</span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">{patientData.allergies}</p>
                  </div>
                )}

                <div className="space-y-3 pt-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{patientData.email || 'No email on file'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{patientData.phone || 'No phone on file'}</span>
                  </div>
                </div>

                {/* Health Summary Button */}
                <button
                  onClick={() => setShowHealthSummary(true)}
                  className="w-full mt-4 btn-primary inline-flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View My Health Summary</span>
                </button>
              </div>
            </div>
          </div>

          {/* Medical Records & Lab Results */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Medical Records */}
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Medical Records</h2>
              </div>

              {patientData.medical_records && patientData.medical_records.length > 0 ? (
                <div className="space-y-4">
                  {patientData.medical_records.slice(0, 5).map((record) => (
                    <div key={record.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{record.diagnosis || 'General Visit'}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(record.visit_date).toLocaleDateString()}
                        </span>
                      </div>
                      {record.chief_complaint && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Complaint:</strong> {record.chief_complaint}
                        </p>
                      )}
                      {record.prescription && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Prescription:</strong> {record.prescription}
                        </p>
                      )}
                      {record.doctor_name && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <strong>Provider:</strong> {record.doctor_name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No medical records found</p>
                </div>
              )}
            </div>

            {/* Lab Results */}
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-6">
                <TestTube className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lab Results</h2>
              </div>

              {patientData.lab_results && patientData.lab_results.length > 0 ? (
                <div className="space-y-4">
                  {patientData.lab_results.slice(0, 5).map((lab) => (
                    <div key={lab.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{lab.test_name}</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(lab.test_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {lab.test_value} {lab.test_unit}
                          </span>
                          {lab.reference_range && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Reference: {lab.reference_range}
                            </p>
                          )}
                        </div>
                        {lab.is_abnormal && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            Abnormal
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No lab results found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Health Summary Modal */}
      {patientData?.medical_record_number && (
        <PatientHealthSummaryModal
          isOpen={showHealthSummary}
          onClose={() => setShowHealthSummary(false)}
          mrn={patientData.medical_record_number}
        />
      )}
    </div>
  );
}
