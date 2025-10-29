import { useState, useEffect, useCallback } from "react";
import { 
  X, 
  Lightbulb, 
  GraduationCap,
  Target,
  CheckCircle,
  Layers,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from "lucide-react";

interface SyntheticCase {
  id: string;
  case_title: string;
  patient_profile: {
    age: number;
    gender: string;
    presentation: string;
  };
  clinical_scenario: string;
  learning_objectives: string[];
  teaching_points: string[];
  case_complexity: string;
  educational_value: number;
}

interface SyntheticCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export default function SyntheticCasesModal({ isOpen, onClose, patientId }: SyntheticCasesModalProps) {
  const [syntheticCases, setSyntheticCases] = useState<SyntheticCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<SyntheticCase | null>(null);
  const [complexity, setComplexity] = useState<string>("moderate");
  const [caseCount, setCaseCount] = useState<number>(3);

  const generateCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/patients/${patientId}/synthetic-cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: caseCount,
          complexity: complexity
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate synthetic cases');
      }

      const data = await response.json();
      setSyntheticCases(data.synthetic_cases || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cases');
    } finally {
      setLoading(false);
    }
  }, [caseCount, complexity, patientId]);

  useEffect(() => {
    if (isOpen && patientId) {
      void generateCases();
    }
  }, [generateCases, isOpen, patientId]);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "simple": return "text-green-700 bg-green-100 border-green-200";
      case "moderate": return "text-blue-700 bg-blue-100 border-blue-200";
      case "complex": return "text-cyan-700 bg-cyan-100 border-cyan-200";
      default: return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getEducationalValueColor = (value: number) => {
    if (value >= 0.8) return "text-emerald-700 bg-emerald-100";
    if (value >= 0.6) return "text-blue-700 bg-blue-100";
    return "text-amber-700 bg-amber-100";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex">
        {/* Main Panel */}
        <div className={`${selectedCase ? 'w-1/2' : 'w-full'} flex flex-col`}>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Synthetic Cases</h2>
                  <p className="text-sm text-gray-600">AI-generated educational case scenarios</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Generation Controls */}
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Complexity:</label>
                  <select
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="simple">Simple</option>
                    <option value="moderate">Moderate</option>
                    <option value="complex">Complex</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Cases:</label>
                  <select
                    value={caseCount}
                    onChange={(e) => setCaseCount(Number(e.target.value))}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value={2}>2 Cases</option>
                    <option value={3}>3 Cases</option>
                    <option value={4}>4 Cases</option>
                    <option value={5}>5 Cases</option>
                  </select>
                </div>
                <button
                  onClick={() => void generateCases()}
                  disabled={loading}
                  className="btn-primary inline-flex items-center space-x-2 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Generate New Cases</span>
                </button>
              </div>

              <div className="text-xs text-gray-500 bg-cyan-50 p-3 rounded-xl">
                <div className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-cyan-800">Educational Case Generation</p>
                    <p className="text-cyan-600">
                      AI creates realistic educational scenarios based on the current patient's medical profile for teaching and learning purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-50 to-indigo-50 px-6 py-4 rounded-2xl border border-cyan-100 mb-4">
                  <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                  <div className="text-left">
                    <p className="font-medium text-cyan-800">Generating Educational Cases</p>
                    <p className="text-sm text-cyan-600">AI is creating synthetic case scenarios...</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-3 bg-red-50 px-6 py-4 rounded-2xl border border-red-100 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div className="text-left">
                    <p className="font-medium text-red-800">Generation Failed</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => void generateCases()}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && syntheticCases.length === 0 && (
              <div className="text-center py-12">
                <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No cases generated yet</p>
                <p className="text-sm text-gray-500">Click "Generate New Cases" to create educational scenarios</p>
              </div>
            )}

            {!loading && !error && syntheticCases.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Generated {syntheticCases.length} educational case{syntheticCases.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="space-y-4">
                  {syntheticCases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedCase(caseItem)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">{caseItem.case_title}</h3>
                          
                          <div className="flex items-center space-x-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getComplexityColor(caseItem.case_complexity)}`}>
                              {caseItem.case_complexity.charAt(0).toUpperCase() + caseItem.case_complexity.slice(1)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEducationalValueColor(caseItem.educational_value)}`}>
                              Educational Value: {Math.round(caseItem.educational_value * 100)}%
                            </span>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <h4 className="text-sm font-medium text-gray-800 mb-1">Patient Profile</h4>
                            <div className="text-sm text-gray-600">
                              <p>Age: {caseItem.patient_profile.age} • Gender: {caseItem.patient_profile.gender}</p>
                              <p className="mt-1">{caseItem.patient_profile.presentation}</p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mb-3">{caseItem.clinical_scenario}</p>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Target className="w-3 h-3" />
                              <span>{caseItem.learning_objectives.length} objectives</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <GraduationCap className="w-3 h-3" />
                              <span>{caseItem.teaching_points.length} teaching points</span>
                            </span>
                          </div>
                        </div>

                        <div className="ml-4">
                          <span className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            View Details →
                          </span>
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
        {selectedCase && (
          <div className="w-1/2 border-l border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Case Details
                </h3>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Case Title & Metadata */}
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-3">{selectedCase.case_title}</h4>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getComplexityColor(selectedCase.case_complexity)}`}>
                    {selectedCase.case_complexity.charAt(0).toUpperCase() + selectedCase.case_complexity.slice(1)} Case
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEducationalValueColor(selectedCase.educational_value)}`}>
                    {Math.round(selectedCase.educational_value * 100)}% Educational Value
                  </span>
                </div>
              </div>

              {/* Patient Profile */}
              <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>Patient Profile</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{selectedCase.patient_profile.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{selectedCase.patient_profile.gender}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <span className="text-gray-600 text-sm">Presentation:</span>
                    <p className="text-gray-800 mt-1">{selectedCase.patient_profile.presentation}</p>
                  </div>
                </div>
              </div>

              {/* Clinical Scenario */}
              <div className="card bg-gradient-to-br from-cyan-50 to-pink-50 border-cyan-100">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-cyan-500" />
                  <span>Clinical Scenario</span>
                </h4>
                <p className="text-gray-700 leading-relaxed">{selectedCase.clinical_scenario}</p>
              </div>

              {/* Learning Objectives */}
              <div className="card bg-gradient-to-br from-green-50 to-teal-50 border-green-100">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span>Learning Objectives</span>
                </h4>
                <ul className="space-y-2">
                  {selectedCase.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Teaching Points */}
              <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-orange-100">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-orange-500" />
                  <span>Key Teaching Points</span>
                </h4>
                <ul className="space-y-2">
                  {selectedCase.teaching_points.map((point, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-orange-500 mt-1" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Educational Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <GraduationCap className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Educational Use Only</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      This is a synthetic case generated for educational purposes. It should be used for learning, 
                      training, and academic discussion only. Always use verified clinical data for actual patient care.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
