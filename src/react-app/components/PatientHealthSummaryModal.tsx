import { useState, useEffect } from "react";
import { 
  X, 
  Heart, 
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
  Check,
  Copy
} from "lucide-react";

interface HealthSummaryData {
  summary: string;
  generated_at: string;
  diagnoses: string[];
  medications: string[];
  ai_generated: boolean;
  fallback?: boolean;
}

interface PatientHealthSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mrn: string;
}

export default function PatientHealthSummaryModal({ isOpen, onClose, mrn }: PatientHealthSummaryModalProps) {
  const [summaryData, setSummaryData] = useState<HealthSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchHealthSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/patient-health-summary/${mrn}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch health summary');
      }
      
      const data = await response.json() as HealthSummaryData;
      setSummaryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && mrn) {
      void fetchHealthSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mrn]);

  const copyToClipboard = async () => {
    if (summaryData) {
      try {
        await navigator.clipboard.writeText(summaryData.summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const printSummary = () => {
    if (summaryData) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Health Summary</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
              }
              h1, h2 { color: #2563eb; }
              h1 { border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
              h2 { margin-top: 24px; }
              p { margin: 8px 0; }
              .alert { 
                background: #fef2f2; 
                border-left: 4px solid #ef4444; 
                padding: 12px; 
                margin: 16px 0;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ccc;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div style="white-space: pre-wrap;">${summaryData.summary.replace(/\n/g, '<br>')}</div>
            <div class="footer">
              Generated: ${new Date(summaryData.generated_at).toLocaleString()}<br>
              This is a computer-generated summary for educational purposes only.
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Health Summary</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personalized health guidance & recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-6 py-4 rounded-2xl border border-green-100 dark:border-green-800 mb-4">
              <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
              <div className="text-left">
                <p className="font-medium text-green-800 dark:text-green-300">Generating Your Health Summary</p>
                <p className="text-sm text-green-600 dark:text-green-400">Creating personalized health guidance...</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3 bg-red-50 dark:bg-red-900/20 px-6 py-4 rounded-2xl border border-red-100 dark:border-red-800 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div className="text-left">
                <p className="font-medium text-red-800 dark:text-red-300">Failed to Load Summary</p>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
            <button
              onClick={() => void fetchHealthSummary()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && summaryData && (
          <>
            {/* AI Badge */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {summaryData.ai_generated && !summaryData.fallback && (
                  <div className="inline-flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>AI-Generated</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Generated: {new Date(summaryData.generated_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={printSummary}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Print summary"
                >
                  <FileText className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Conditions & Medications Summary */}
            {(summaryData.diagnoses.length > 0 || summaryData.medications.length > 0) && (
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {summaryData.diagnoses.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Your Conditions</h3>
                    <ul className="space-y-1">
                      {summaryData.diagnoses.map((diagnosis, idx) => (
                        <li key={idx} className="text-sm text-blue-800 dark:text-blue-400">• {diagnosis}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {summaryData.medications.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                    <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">Your Medications</h3>
                    <ul className="space-y-1">
                      {summaryData.medications.map((medication, idx) => (
                        <li key={idx} className="text-sm text-green-800 dark:text-green-400">• {medication}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Main Summary Content */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                  {summaryData.summary}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Important Medical Disclaimer</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    This summary is for educational purposes only and should not replace professional medical advice. 
                    Always consult your healthcare provider before making changes to your treatment plan or if you have 
                    questions about your health. In case of emergency, call emergency services immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <button
                onClick={() => void fetchHealthSummary()}
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Refresh Summary</span>
              </button>
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
