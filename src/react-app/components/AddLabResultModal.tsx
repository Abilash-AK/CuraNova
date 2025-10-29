import { useState } from "react";
import { createLabResult } from "@/react-app/hooks/useApi";
import { LabResultSchema } from "@/shared/types";
import { X, FlaskConical, AlertCircle } from "lucide-react";

interface AddLabResultModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddLabResultModal({
  patientId,
  isOpen,
  onClose,
  onSuccess,
}: AddLabResultModalProps) {
  const [formData, setFormData] = useState({
    test_name: "",
    test_value: "",
    test_unit: "",
    reference_range: "",
    test_date: new Date().toISOString().split('T')[0],
    is_abnormal: false,
    doctor_name: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const labData = {
        patient_id: parseInt(patientId),
        user_id: "", // Will be set by backend
        test_name: formData.test_name,
        test_value: formData.test_value,
        test_unit: formData.test_unit || undefined,
        reference_range: formData.reference_range || undefined,
        test_date: formData.test_date,
        is_abnormal: formData.is_abnormal,
        doctor_name: formData.doctor_name || undefined
      };

      // Validate with Zod schema
      const validatedData = LabResultSchema.parse(labData);
      
      await createLabResult(patientId, validatedData);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        test_name: "",
        test_value: "",
        test_unit: "",
        reference_range: "",
        test_date: new Date().toISOString().split('T')[0],
        is_abnormal: false,
        doctor_name: ""
      });
    } catch (err) {
      console.error("Error creating lab result:", err);
      setError(err instanceof Error ? err.message : "Failed to create lab result");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-2xl flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black">Add Lab Result</h2>
                <p className="text-sm text-black">Record laboratory test results</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Test Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-black border-b border-gray-100 pb-2">Test Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Test Name *
                </label>
                <input
                  type="text"
                  name="test_name"
                  value={formData.test_name}
                  onChange={handleChange}
                  placeholder="e.g., Complete Blood Count"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Test Date *
                </label>
                <input
                  type="date"
                  name="test_date"
                  value={formData.test_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Doctor Name
              </label>
              <input
                type="text"
                name="doctor_name"
                value={formData.doctor_name}
                onChange={handleChange}
                placeholder="e.g., Dr. Johnson"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-black dark:text-black dark:bg-white/90"
              />
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <h3 className="font-medium text-black border-b border-gray-100 pb-2">Test Results</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Test Value *
                </label>
                <input
                  type="text"
                  name="test_value"
                  value={formData.test_value}
                  onChange={handleChange}
                  placeholder="e.g., 7.2, Normal, Positive"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  name="test_unit"
                  value={formData.test_unit}
                  onChange={handleChange}
                  placeholder="e.g., mg/dL, g/dL, %"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Reference Range
              </label>
              <input
                type="text"
                name="reference_range"
                value={formData.reference_range}
                onChange={handleChange}
                placeholder="e.g., 4.0-10.0, Normal: <100"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-black dark:text-black dark:bg-white/90"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="is_abnormal"
                id="is_abnormal"
                checked={formData.is_abnormal}
                onChange={handleChange}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="is_abnormal" className="text-sm font-medium text-black">
                Mark as abnormal result
              </label>
            </div>
          </div>

          {/* Common Lab Tests Quick Fill */}
          <div className="space-y-4">
            <h3 className="font-medium text-black border-b border-gray-100 pb-2">Quick Fill Common Tests</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { name: "Complete Blood Count", unit: "K/μL" },
                { name: "Basic Metabolic Panel", unit: "mg/dL" },
                { name: "Lipid Panel", unit: "mg/dL" },
                { name: "Thyroid Panel", unit: "ng/dL" },
                { name: "Hemoglobin A1C", unit: "%" },
                { name: "Urinalysis", unit: "" },
                { name: "Liver Function", unit: "U/L" },
                { name: "Kidney Function", unit: "mg/dL" }
              ].map((test, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    test_name: test.name,
                    test_unit: test.unit
                  }))}
                  className="text-xs px-3 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors"
                >
                  {test.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-black font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4" />
                  <span>Add Result</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
