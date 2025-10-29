import { useState, useEffect, useCallback } from "react";
import { X, Users, Calendar, Heart, FlaskConical, TrendingUp, AlertCircle, Loader } from "lucide-react";
import { Link } from "react-router";

interface SimilarPatient {
  id: number;
  case_id: string;
  age: number | null;
  gender: string | null;
  blood_type: string | null;
  allergies: string | null;
  latest_diagnosis: string | null;
  latest_visit_date: string;
  medical_records_count: number;
  medical_timeline: Array<{
    date: string;
    diagnosis: string;
    chief_complaint: string;
    prescription: string;
    notes: string;
    doctor_name: string;
    vital_signs: {
      bp?: string;
      hr?: number;
      temp?: number;
      weight?: number;
    };
  }>;
  lab_results: Array<{
    test_name: string;
    test_value: string;
    test_unit: string;
    test_date: string;
    is_abnormal: boolean;
    doctor_name: string;
  }>;
  common_conditions: string[];
  similarity_score: number;
}

interface SimilarPatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export default function SimilarPatientsModal({
  isOpen,
  onClose,
  patientId,
}: SimilarPatientsModalProps) {
  const [similarPatients, setSimilarPatients] = useState<SimilarPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<SimilarPatient | null>(null);

  const fetchSimilarPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/patients/${patientId}/similar?type=${searchType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSimilarPatients(data.patients || []);
    } catch (err) {
      console.error("Error fetching similar patients:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch similar patients");
    } finally {
      setLoading(false);
    }
  }, [patientId, searchType]);

  useEffect(() => {
    if (isOpen && patientId) {
      void fetchSimilarPatients();
    }
  }, [fetchSimilarPatients, isOpen, patientId]);

  if (!isOpen) return null;

  const getSimilarityColor = (score: number) => {
    if (score >= 0.75) return "text-emerald-700 bg-emerald-100 border-emerald-200";
    if (score >= 0.60) return "text-blue-700 bg-blue-100 border-blue-200";
    if (score >= 0.45) return "text-amber-700 bg-amber-100 border-amber-200";
    return "text-gray-700 bg-gray-100 border-gray-200";
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.75) return "High Similarity";
    if (score >= 0.60) return "Good Match";
    if (score >= 0.45) return "Moderate Match";
    return "Low Similarity";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        {/* Main Panel */}
        <div className={`${selectedPatient ? 'w-1/2' : 'w-full'} flex flex-col`}>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Similar Cases</h2>
                  <p className="text-sm text-gray-600">Find patients with similar conditions</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Enhanced Search Type Filter */}
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Multi-Factor Analysis", desc: "Uses demographics, conditions, and patterns" },
                  { value: "diagnosis", label: "Medical Conditions", desc: "Focuses on diagnosis patterns" },
                  { value: "symptoms", label: "Symptom Patterns", desc: "Analyzes chief complaints" }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSearchType(type.value)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                      searchType === type.value
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{type.label}</div>
                      <div className={`text-xs ${searchType === type.value ? 'text-orange-100' : 'text-gray-500'}`}>
                        {type.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg">
                💡 Enhanced Algorithm: Uses medical terminology categorization, demographic patterns, and vital sign analysis for more accurate matching
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">Finding similar cases...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && similarPatients.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No similar cases found</p>
                <p className="text-sm text-gray-500">Try adjusting the search criteria</p>
              </div>
            )}

            {!loading && !error && similarPatients.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Found {similarPatients.length} similar case{similarPatients.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="grid gap-4">
                  {similarPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-800">{patient.case_id}</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSimilarityColor(patient.similarity_score)}`}>
                                {Math.round(patient.similarity_score * 100)}%
                              </span>
                              <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                                {getSimilarityLabel(patient.similarity_score)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            {patient.age && <span>Age: {patient.age}</span>}
                            {patient.gender && <span>Gender: {patient.gender}</span>}
                            {patient.blood_type && <span>Blood: {patient.blood_type}</span>}
                          </div>

                          {patient.latest_diagnosis && (
                            <p className="text-sm text-gray-700 mb-2">
                              <span className="font-medium">Latest Diagnosis:</span> {patient.latest_diagnosis}
                            </p>
                          )}

                          {patient.common_conditions && patient.common_conditions.length > 0 && (
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-gray-600">Matching Patterns:</span>
                                {patient.similarity_score >= 0.75 && (
                                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    ✨ Strong Match
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {patient.common_conditions.slice(0, 4).map((condition, index) => (
                                  <span
                                    key={index}
                                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                      index === 0 ? 'bg-indigo-100 text-indigo-700' :
                                      index === 1 ? 'bg-cyan-100 text-cyan-700' :
                                      index === 2 ? 'bg-pink-100 text-pink-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {condition}
                                  </span>
                                ))}
                                {patient.common_conditions.length > 4 && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                    +{patient.common_conditions.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Last visit: {formatDate(patient.latest_visit_date)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{patient.medical_records_count} records</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FlaskConical className="w-3 h-3" />
                              <span>{patient.lab_results?.length || 0} lab results</span>
                            </span>
                          </div>
                        </div>

                        <div className="ml-4">
                          <Link
                            to={`/patients/${patient.id}?anonymized=true`}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Case →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedPatient && (
          <div className="w-1/2 border-l border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Case Details: {selectedPatient.case_id}
                </h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Patient Overview */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Patient Overview</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedPatient.age && (
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <span className="ml-2 font-medium">{selectedPatient.age} years</span>
                      </div>
                    )}
                    {selectedPatient.gender && (
                      <div>
                        <span className="text-gray-500">Gender:</span>
                        <span className="ml-2 font-medium">{selectedPatient.gender}</span>
                      </div>
                    )}
                    {selectedPatient.blood_type && (
                      <div>
                        <span className="text-gray-500">Blood Type:</span>
                        <span className="ml-2 font-medium">{selectedPatient.blood_type}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Similarity:</span>
                      <span className="ml-2 font-medium">{Math.round(selectedPatient.similarity_score * 100)}%</span>
                    </div>
                  </div>
                  
                  {selectedPatient.allergies && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-gray-500 text-sm">Allergies:</span>
                      <p className="text-sm mt-1">{selectedPatient.allergies}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Timeline */}
              {selectedPatient.medical_timeline && selectedPatient.medical_timeline.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Medical Timeline</span>
                  </h4>
                  <div className="space-y-3">
                    {selectedPatient.medical_timeline.slice(0, 5).map((record, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-3">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800">
                            {formatDate(record.date)}
                          </span>
                          {record.vital_signs && (
                            <div className="text-xs text-gray-500">
                              {record.vital_signs.bp && <span>BP: {record.vital_signs.bp}</span>}
                              {record.vital_signs.hr && <span className="ml-2">HR: {record.vital_signs.hr}</span>}
                            </div>
                          )}
                        </div>
                        
                        {record.chief_complaint && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Complaint:</span> {record.chief_complaint}
                          </p>
                        )}
                        
                        {record.diagnosis && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                          </p>
                        )}
                        
                        {record.prescription && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Treatment:</span> {record.prescription}
                          </p>
                        )}
                        
                        {record.doctor_name && (
                          <p className="text-xs text-gray-500 mt-2">
                            Doctor: {record.doctor_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Lab Results */}
              {selectedPatient.lab_results && selectedPatient.lab_results.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
                    <FlaskConical className="w-4 h-4" />
                    <span>Recent Lab Results</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedPatient.lab_results.slice(0, 5).map((result, index) => (
                      <div
                        key={index}
                        className={`border rounded-xl p-3 ${
                          result.is_abnormal ? "border-red-200 bg-red-50" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">
                            {result.test_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(result.test_date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-sm ${result.is_abnormal ? "text-red-600" : "text-gray-600"}`}>
                            {result.test_value} {result.test_unit}
                          </span>
                          {result.is_abnormal && (
                            <span className="text-xs text-red-600 font-medium">Abnormal</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Full Case Button */}
              <div className="pt-4 border-t border-gray-200">
                <Link
                  to={`/patients/${selectedPatient.id}?anonymized=true`}
                  className="btn-primary w-full text-center inline-block"
                  onClick={onClose}
                >
                  View Full Anonymized Case
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
