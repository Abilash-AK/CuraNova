import Layout from "@/react-app/components/Layout";
import { usePatient } from "@/react-app/hooks/useApi";
import { useParams, Link, useSearchParams } from "react-router";
import { useState } from "react";
import { useRole } from "@/react-app/contexts/RoleContext";
import AddMedicalRecordModal from "@/react-app/components/AddMedicalRecordModal";
import AddLabResultModal from "@/react-app/components/AddLabResultModal";
import EditPatientModal from "@/react-app/components/EditPatientModal";
import EditMedicalRecordModal from "@/react-app/components/EditMedicalRecordModal";
import EditLabResultModal from "@/react-app/components/EditLabResultModal";
import DeleteConfirmationModal from "@/react-app/components/DeleteConfirmationModal";
import AISummaryModal from "@/react-app/components/AISummaryModal";
import HealthMetricsCharts from "@/react-app/components/HealthMetricsCharts";
import SimilarPatientsModal from "@/react-app/components/SimilarPatientsModal";
import MedicalLiteratureModal from "@/react-app/components/MedicalLiteratureModal";
import SyntheticCasesModal from "@/react-app/components/SyntheticCasesModal";
import { deletePatient, deleteMedicalRecord, deleteLabResult } from "@/react-app/hooks/useApi";
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Heart,
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
  FlaskConical,
  Stethoscope,
  Brain,
  Users,
  BookOpen,
  Lightbulb
} from "lucide-react";
import type { LabResult, MedicalRecord } from "@/shared/types";

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isAnonymized = searchParams.get('anonymized') === 'true';
  const { isDoctor } = useRole();
  const { data: patient, loading, error, refetch } = usePatient(id!);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddLab, setShowAddLab] = useState(false);
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [showEditRecord, setShowEditRecord] = useState(false);
  const [showEditLab, setShowEditLab] = useState(false);
  const [showDeletePatient, setShowDeletePatient] = useState(false);
  const [showDeleteRecord, setShowDeleteRecord] = useState(false);
  const [showDeleteLab, setShowDeleteLab] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showSimilarPatients, setShowSimilarPatients] = useState(false);
  const [showMedicalLiterature, setShowMedicalLiterature] = useState(false);
  const [showSyntheticCases, setShowSyntheticCases] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [editingLab, setEditingLab] = useState<LabResult | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MedicalRecord | null>(null);
  const [deletingLab, setDeletingLab] = useState<LabResult | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-secondary mt-4">Loading patient details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !patient) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-red-600 mb-4">Failed to load patient details</p>
          <Link to="/patients" className="btn-secondary">
            Back to Patients
          </Link>
        </div>
      </Layout>
    );
  }

  const age = patient.date_of_birth 
    ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
    : null;

  const handleDeletePatient = async () => {
    setDeleteLoading(true);
    try {
      await deletePatient(patient.id!);
      // Navigate back to patients list
      window.history.back();
    } catch (error) {
      console.error('Failed to delete patient:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeletePatient(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!deletingRecord?.id) {
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteMedicalRecord(id!, deletingRecord.id);
      refetch();
    } catch (error) {
      console.error('Failed to delete medical record:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteRecord(false);
      setDeletingRecord(null);
    }
  };

  const handleDeleteLab = async () => {
    if (!deletingLab?.id) {
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteLabResult(id!, deletingLab.id);
      refetch();
    } catch (error) {
      console.error('Failed to delete lab result:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteLab(false);
      setDeletingLab(null);
    }
  };

  const openEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setShowEditRecord(true);
  };

  const openDeleteRecord = (record: MedicalRecord) => {
    setDeletingRecord(record);
    setShowDeleteRecord(true);
  };

  const openEditLab = (lab: LabResult) => {
    setEditingLab(lab);
    setShowEditLab(true);
  };

  const openDeleteLab = (lab: LabResult) => {
    setDeletingLab(lab);
    setShowDeleteLab(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/patients" 
              className="p-2 hover:bg-white/50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-secondary" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                {isAnonymized ? `Case C${patient.id?.toString().padStart(4, '0')}` : `${patient.first_name} ${patient.last_name}`}
              </h1>
              <p className="text-secondary mt-1">
                {isAnonymized ? "Anonymized Medical Case Reference" : "Patient Details & Medical History"}
              </p>
            </div>
          </div>
          {!isAnonymized && (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowEditPatient(true)}
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Patient</span>
              </button>
              <button 
                onClick={() => setShowDeletePatient(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors inline-flex items-center space-x-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Delete Patient</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient Info Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">
                    {isAnonymized ? "C" + (patient.id?.toString().slice(-1) || "X") : `${patient.first_name[0]}${patient.last_name[0]}`}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-primary">
                  {isAnonymized ? `Case C${patient.id?.toString().padStart(4, '0')}` : `${patient.first_name} ${patient.last_name}`}
                </h3>
                {age && (
                  <p className="text-secondary">{age} years old</p>
                )}
              </div>

              <div className="space-y-4">
                {!isAnonymized && patient.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-secondary">{patient.email}</span>
                  </div>
                )}
                {!isAnonymized && patient.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-secondary">{patient.phone}</span>
                  </div>
                )}
                {patient.date_of_birth && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-secondary">
                      {isAnonymized ? `Age: ${age} years` : new Date(patient.date_of_birth).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {!isAnonymized && patient.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-sm text-secondary">{patient.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Info */}
            <div className="card">
              <h4 className="font-semibold text-primary mb-4 flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Medical Information</span>
              </h4>
              
              <div className="space-y-3">
                {patient.medical_record_number && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">MRN</span>
                    <span className="text-sm font-medium text-primary">
                      {patient.medical_record_number}
                    </span>
                  </div>
                )}
                {patient.blood_type && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Blood Type</span>
                    <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      {patient.blood_type}
                    </span>
                  </div>
                )}
                {patient.gender && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Gender</span>
                    <span className="text-sm font-medium text-primary">
                      {patient.gender}
                    </span>
                  </div>
                )}
              </div>

              {patient.allergies && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Allergies</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">{patient.allergies}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Contact */}
            {!isAnonymized && (patient.emergency_contact_name || patient.emergency_contact_phone) && (
              <div className="card">
                <h4 className="font-semibold text-primary mb-4 flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span>Emergency Contact</span>
                </h4>
                
                <div className="space-y-2">
                  {patient.emergency_contact_name && (
                    <p className="text-sm font-medium text-primary">
                      {patient.emergency_contact_name}
                    </p>
                  )}
                  {patient.emergency_contact_phone && (
                    <p className="text-sm text-secondary">
                      {patient.emergency_contact_phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            {!isAnonymized && (
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                <button 
                  onClick={() => setShowAddRecord(true)}
                  className="card card-hover p-4 text-center"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-primary">New Visit</p>
                  <p className="text-xs text-muted">Record consultation</p>
                </button>

                <button 
                  onClick={() => setShowAddLab(true)}
                  className="card card-hover p-4 text-center"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <FlaskConical className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-primary">Add Lab Result</p>
                  <p className="text-xs text-muted">Upload test results</p>
                </button>

                {isDoctor && (
                  <button 
                    onClick={() => setShowSimilarPatients(true)}
                    className="card card-hover p-4 text-center"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-primary">Find Similar Cases</p>
                    <p className="text-xs text-muted">Compare with similar patients</p>
                  </button>
                )}

                {isDoctor && (
                  <button 
                    onClick={() => setShowAISummary(true)}
                    className="card card-hover p-4 text-center"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-primary">AI Summary</p>
                    <p className="text-xs text-muted">Generate insights</p>
                  </button>
                )}

                {isDoctor && (
                  <button 
                    onClick={() => setShowMedicalLiterature(true)}
                    className="card card-hover p-4 text-center"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-primary">Medical Literature</p>
                    <p className="text-xs text-muted">Research articles</p>
                  </button>
                )}

                {isDoctor && (
                  <button 
                    onClick={() => setShowSyntheticCases(true)}
                    className="card card-hover p-4 text-center"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-primary">Synthetic Cases</p>
                    <p className="text-xs text-muted">Educational scenarios</p>
                  </button>
                )}
              </div>
            )}

            {/* Health Metrics Charts */}
            {((patient.medical_records && patient.medical_records.length > 0) || 
              (patient.lab_results && patient.lab_results.length > 0)) && (
              <div className="card">
                <div className="flex items-center space-x-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-primary">Health Metrics & Trends</h3>
                </div>
                
                <HealthMetricsCharts 
                  medicalRecords={patient.medical_records || []} 
                  labResults={patient.lab_results || []} 
                />
              </div>
            )}

            {/* Medical Records */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-primary flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span>Medical Records</span>
                </h3>
                {!isAnonymized && (
                  <button 
                    onClick={() => setShowAddRecord(true)}
                    className="btn-secondary inline-flex items-center space-x-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Record</span>
                  </button>
                )}
              </div>

              {patient.medical_records && patient.medical_records.length > 0 ? (
                <div className="space-y-4">
                  {patient.medical_records.map((record) => (
                    <div key={record.id} className="p-4 border border-gray-100 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-primary">
                            {record.chief_complaint || 'General Consultation'}
                          </p>
                          <p className="text-sm text-secondary">
                            {new Date(record.visit_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {(record.blood_pressure_systolic || record.heart_rate || record.temperature) && (
                            <div className="text-right">
                              <div className="text-xs text-gray-500 space-y-1">
                                {record.blood_pressure_systolic && (
                                  <div>BP: {record.blood_pressure_systolic}/{record.blood_pressure_diastolic}</div>
                                )}
                                {record.heart_rate && (
                                  <div>HR: {record.heart_rate} bpm</div>
                                )}
                                {record.temperature && (
                                  <div>Temp: {record.temperature}°F</div>
                                )}
                              </div>
                            </div>
                          )}
                          {!isAnonymized && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => openEditRecord(record)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                                title="Edit record"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteRecord(record)}
                                className="p-1 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"
                                title="Delete record"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {record.diagnosis && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-primary">Diagnosis: </span>
                          <span className="text-sm text-secondary">{record.diagnosis}</span>
                        </div>
                      )}
                      
                      {record.prescription && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-primary">Prescription: </span>
                          <span className="text-sm text-secondary">{record.prescription}</span>
                        </div>
                      )}
                      
                      {record.notes && (
                        <div>
                          <span className="text-sm font-medium text-primary">Notes: </span>
                          <span className="text-sm text-secondary">{record.notes}</span>
                        </div>
                      )}
                      
                      {record.doctor_name && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs font-medium text-muted">Treating Doctor: </span>
                          <span className="text-xs text-secondary">{record.doctor_name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-secondary mb-4">No medical records yet</p>
                  <button 
                    onClick={() => setShowAddRecord(true)}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Record</span>
                  </button>
                </div>
              )}
            </div>

            {/* Lab Results */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-primary flex items-center space-x-2">
                  <FlaskConical className="w-5 h-5 text-purple-500" />
                  <span>Lab Results</span>
                </h3>
                {!isAnonymized && (
                  <button 
                    onClick={() => setShowAddLab(true)}
                    className="btn-secondary inline-flex items-center space-x-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Result</span>
                  </button>
                )}
              </div>

              {patient.lab_results && patient.lab_results.length > 0 ? (
                <div className="space-y-4">
                  {patient.lab_results.map((result) => (
                    <div 
                      key={result.id} 
                      className={`p-4 border rounded-xl ${
                        result.is_abnormal 
                          ? 'border-red-300 bg-white/90 dark:border-red-400 dark:bg-white/95' 
                          : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={`font-medium ${
                            result.is_abnormal ? 'text-black dark:text-black' : 'text-primary'
                          }`}>{result.test_name}</p>
                          <p className={`text-sm ${
                            result.is_abnormal ? 'text-black dark:text-black' : 'text-secondary'
                          }`}>
                            {new Date(result.test_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className={`font-medium ${
                              result.is_abnormal ? 'text-black dark:text-black' : 'text-primary'
                            }`}>
                              {result.test_value} {result.test_unit}
                            </p>
                            {result.reference_range && (
                              <p className={`text-xs ${
                                result.is_abnormal ? 'text-black dark:text-black' : 'text-muted'
                              }`}>
                                Ref: {result.reference_range}
                              </p>
                            )}
                          </div>
                          {!isAnonymized && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => openEditLab(result)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                                title="Edit result"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteLab(result)}
                                className="p-1 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"
                                title="Delete result"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {result.doctor_name && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <span className="text-xs font-medium text-muted">Ordered by: </span>
                            <span className="text-xs text-secondary">{result.doctor_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-secondary mb-4">No lab results yet</p>
                  <button 
                    onClick={() => setShowAddLab(true)}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Result</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddMedicalRecordModal
          patientId={id!}
          isOpen={showAddRecord}
          onClose={() => setShowAddRecord(false)}
          onSuccess={() => {
            refetch();
          }}
        />

        <AddLabResultModal
          patientId={id!}
          isOpen={showAddLab}
          onClose={() => setShowAddLab(false)}
          onSuccess={() => {
            refetch();
          }}
        />

        {patient && (
          <EditPatientModal
            patient={patient}
            isOpen={showEditPatient}
            onClose={() => setShowEditPatient(false)}
            onSuccess={async () => {
              await refetch();
              setShowEditPatient(false);
            }}
          />
        )}

        {editingRecord && (
          <EditMedicalRecordModal
            patientId={id!}
            record={editingRecord}
            isOpen={showEditRecord}
            onClose={() => {
              setShowEditRecord(false);
              setEditingRecord(null);
            }}
            onSuccess={() => {
              refetch();
              setShowEditRecord(false);
              setEditingRecord(null);
            }}
          />
        )}

        {editingLab && (
          <EditLabResultModal
            patientId={id!}
            result={editingLab}
            isOpen={showEditLab}
            onClose={() => {
              setShowEditLab(false);
              setEditingLab(null);
            }}
            onSuccess={() => {
              refetch();
              setShowEditLab(false);
              setEditingLab(null);
            }}
          />
        )}

        <DeleteConfirmationModal
          isOpen={showDeletePatient}
          onClose={() => setShowDeletePatient(false)}
          onConfirm={handleDeletePatient}
          title="Delete Patient"
          message={`Are you sure you want to delete ${patient?.first_name} ${patient?.last_name}? This action cannot be undone and will permanently remove all associated medical records and lab results.`}
          confirmText="Delete Patient"
          loading={deleteLoading}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteRecord}
          onClose={() => {
            setShowDeleteRecord(false);
            setDeletingRecord(null);
          }}
          onConfirm={handleDeleteRecord}
          title="Delete Medical Record"
          message="Are you sure you want to delete this medical record? This action cannot be undone."
          confirmText="Delete Record"
          loading={deleteLoading}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteLab}
          onClose={() => {
            setShowDeleteLab(false);
            setDeletingLab(null);
          }}
          onConfirm={handleDeleteLab}
          title="Delete Lab Result"
          message="Are you sure you want to delete this lab result? This action cannot be undone."
          confirmText="Delete Result"
          loading={deleteLoading}
        />

        {/* Similar Patients Modal */}
        {isDoctor && patient && (
          <SimilarPatientsModal
            isOpen={showSimilarPatients}
            onClose={() => setShowSimilarPatients(false)}
            patientId={id!}
          />
        )}

        {/* AI Summary Modal */}
        {isDoctor && patient && (
          <AISummaryModal
            patient={patient}
            isOpen={showAISummary}
            onClose={() => setShowAISummary(false)}
          />
        )}

        {/* Medical Literature Modal */}
        {isDoctor && (
          <MedicalLiteratureModal
            isOpen={showMedicalLiterature}
            onClose={() => setShowMedicalLiterature(false)}
            patientId={id!}
          />
        )}

        {/* Synthetic Cases Modal */}
        {isDoctor && (
          <SyntheticCasesModal
            isOpen={showSyntheticCases}
            onClose={() => setShowSyntheticCases(false)}
            patientId={id!}
          />
        )}
      </div>
    </Layout>
  );
}
