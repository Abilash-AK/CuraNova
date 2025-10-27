import { useState } from "react";
import { updateLabResult } from "@/react-app/hooks/useApi";
import type { LabResult } from "@/shared/types";
import { 
  X, 
  Calendar, 
  FlaskConical, 
  AlertTriangle,
  Save
} from "lucide-react";

interface EditLabResultModalProps {
  patientId: string;
  result: LabResult;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditLabResultModal({ 
  patientId, 
  result,
  isOpen, 
  onClose, 
  onSuccess 
}: EditLabResultModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    test_name: result.test_name || '',
    test_value: result.test_value || '',
    test_unit: result.test_unit || '',
    reference_range: result.reference_range || '',
    test_date: result.test_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    is_abnormal: result.is_abnormal || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const labData = {
        test_name: formData.test_name,
        test_value: formData.test_value,
        test_unit: formData.test_unit || undefined,
        reference_range: formData.reference_range || undefined,
        test_date: formData.test_date,
        is_abnormal: formData.is_abnormal,
      };

      await updateLabResult(patientId, result.id!, labData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update lab result:', error);
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

  if (!isOpen) return null;

  const commonTests = [
    'Complete Blood Count (CBC)',
    'Basic Metabolic Panel (BMP)',
    'Comprehensive Metabolic Panel (CMP)',
    'Lipid Panel',
    'Hemoglobin A1C',
    'Thyroid Stimulating Hormone (TSH)',
    'Vitamin D',
    'Vitamin B12',
    'Iron Studies',
    'Liver Function Tests (LFT)',
    'Kidney Function Tests',
    'Urinalysis',
    'C-Reactive Protein (CRP)',
    'Erythrocyte Sedimentation Rate (ESR)',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Edit Lab Result</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Name *
              </label>
              <select
                name="test_name"
                value={formData.test_name}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select a test</option>
                {commonTests.map(test => (
                  <option key={test} value={test}>{test}</option>
                ))}
                <option value="custom">Other (specify below)</option>
              </select>
              
              {formData.test_name === 'custom' && (
                <input
                  type="text"
                  name="test_name"
                  value=""
                  onChange={(e) => setFormData(prev => ({ ...prev, test_name: e.target.value }))}
                  className="input-field mt-2"
                  placeholder="Enter custom test name"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="test_date"
                  value={formData.test_date}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Value *
                </label>
                <input
                  type="text"
                  name="test_value"
                  value={formData.test_value}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., 5.8, Normal, Positive"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  name="test_unit"
                  value={formData.test_unit}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., mg/dL, %, g/dL"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Range
              </label>
              <input
                type="text"
                name="reference_range"
                value={formData.reference_range}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 4.0-5.6, <200, Normal"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_abnormal"
                name="is_abnormal"
                checked={formData.is_abnormal}
                onChange={handleChange}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
              />
              <label htmlFor="is_abnormal" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Mark as abnormal result</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
