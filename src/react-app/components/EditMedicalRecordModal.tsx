import { useState } from "react";
import { updateMedicalRecord } from "@/react-app/hooks/useApi";
import type { MedicalRecord } from "@/shared/types";
import { 
  X, 
  Calendar, 
  Stethoscope, 
  FileText, 
  Activity,
  Save
} from "lucide-react";

interface EditMedicalRecordModalProps {
  patientId: string;
  record: MedicalRecord;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMedicalRecordModal({ 
  patientId, 
  record,
  isOpen, 
  onClose, 
  onSuccess 
}: EditMedicalRecordModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    visit_date: record.visit_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    chief_complaint: record.chief_complaint || '',
    diagnosis: record.diagnosis || '',
    prescription: record.prescription || '',
    notes: record.notes || '',
    blood_pressure_systolic: record.blood_pressure_systolic?.toString() || '',
    blood_pressure_diastolic: record.blood_pressure_diastolic?.toString() || '',
    heart_rate: record.heart_rate?.toString() || '',
    temperature: record.temperature?.toString() || '',
    weight: record.weight?.toString() || '',
    height: record.height?.toString() || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recordData = {
        visit_date: formData.visit_date,
        chief_complaint: formData.chief_complaint || undefined,
        diagnosis: formData.diagnosis || undefined,
        prescription: formData.prescription || undefined,
        notes: formData.notes || undefined,
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : undefined,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : undefined,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
      };

      await updateMedicalRecord(patientId, record.id!, recordData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update medical record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Edit Medical Record</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visit Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Visit Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    name="visit_date"
                    value={formData.visit_date}
                    onChange={handleChange}
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chief Complaint
                </label>
                <input
                  type="text"
                  name="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="What brought the patient in today?"
                />
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-red-500" />
              <span>Vital Signs</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Systolic BP
                </label>
                <input
                  type="number"
                  name="blood_pressure_systolic"
                  value={formData.blood_pressure_systolic}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diastolic BP
                </label>
                <input
                  type="number"
                  name="blood_pressure_diastolic"
                  value={formData.blood_pressure_diastolic}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="80"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  name="heart_rate"
                  value={formData.heart_rate}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="72"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="98.6"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="150"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="68"
                />
              </div>
            </div>
          </div>

          {/* Clinical Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Clinical Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis
                </label>
                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Primary diagnosis"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescription
                </label>
                <textarea
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleChange}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Medications prescribed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Notes
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="input-field pl-10 resize-none"
                    placeholder="Additional clinical notes and observations"
                  />
                </div>
              </div>
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
