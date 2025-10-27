import { useState, useEffect, useCallback } from "react";
import { 
  X, 
  Brain, 
  Sparkles, 
  TrendingUp,
  AlertTriangle,
  FileText,
  Loader2
} from "lucide-react";
import type { PatientWithRecords } from "@/shared/types";

interface AISummaryModalProps {
  patient: PatientWithRecords;
  isOpen: boolean;
  onClose: () => void;
}

interface AISummary {
  overview: string;
  key_findings: string[];
  risk_factors: string[];
  recommendations: string[];
  trends: string;
}

export default function AISummaryModal({ patient, isOpen, onClose }: AISummaryModalProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/patients/${patient.id}/ai-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  }, [patient.id]);

  useEffect(() => {
    if (isOpen && !summary) {
      void generateSummary();
    }
  }, [generateSummary, isOpen, summary]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-500 rounded-xl flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">AI Health Summary</h2>
              <p className="text-sm text-gray-600">
                {patient.first_name} {patient.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 rounded-2xl border border-green-100 mb-4">
              <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
              <div className="text-left">
                <p className="font-medium text-green-800">Analyzing Patient Data</p>
                <p className="text-sm text-green-600">AI is reviewing medical history and generating insights...</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3 bg-red-50 px-6 py-4 rounded-2xl border border-red-100 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div className="text-left">
                <p className="font-medium text-red-800">Failed to Generate Summary</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={generateSummary}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {summary && (
          <div className="space-y-6">
            {/* AI Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-teal-50 px-4 py-2 rounded-full border border-green-100">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-800">AI-Generated Insights</span>
            </div>

            {/* Overview */}
            <div className="card bg-gradient-to-br from-gray-50 to-white border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-800">Clinical Overview</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{summary.overview}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Key Findings */}
              <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Key Findings</h3>
                </div>
                <ul className="space-y-2">
                  {summary.key_findings.map((finding, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <span className="text-gray-700 text-sm">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Factors */}
              <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-orange-100">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Risk Factors</h3>
                </div>
                <ul className="space-y-2">
                  {summary.risk_factors.map((risk, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                      <span className="text-gray-700 text-sm">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="card bg-gradient-to-br from-green-50 to-teal-50 border-green-100">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
              </div>
              <ul className="space-y-3">
                {summary.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Health Trends */}
            <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-800">Health Trends</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{summary.trends}</p>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">AI Assistance Disclaimer</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This AI-generated summary is for informational purposes only and should not replace professional medical judgment. 
                    Always verify findings and make clinical decisions based on your professional expertise and current guidelines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100 mt-6">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          {summary && (
            <button
              onClick={generateSummary}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>Regenerate Summary</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
