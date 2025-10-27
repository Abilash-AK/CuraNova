import { useState } from "react";
import { createMedicalRecord } from "@/react-app/hooks/useApi";
import { MedicalRecordSchema } from "@/shared/types";
import { X, Stethoscope, AlertCircle } from "lucide-react";

interface AddMedicalRecordModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMedicalRecordModal({
  patientId,
  isOpen,
  onClose,
  onSuccess,
}: AddMedicalRecordModalProps) {
  const [formData, setFormData] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    chief_complaint: "",
    diagnosis: "",
    prescription: "",
    notes: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    heart_rate: "",
    temperature: "",
    weight: "",
    height: "",
    blood_sugar: "",
    cholesterol: "",
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
      // Convert string numbers to actual numbers or null
      const recordData = {
        patient_id: parseInt(patientId),
        user_id: "", // Will be set by backend
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
        blood_sugar: formData.blood_sugar ? parseFloat(formData.blood_sugar) : undefined,
        cholesterol: formData.cholesterol ? parseFloat(formData.cholesterol) : undefined,
        doctor_name: formData.doctor_name || undefined
      };

      // Validate with Zod schema
      const validatedData = MedicalRecordSchema.parse(recordData);
      
      await createMedicalRecord(patientId, validatedData);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        visit_date: new Date().toISOString().split('T')[0],
        chief_complaint: "",
        diagnosis: "",
        prescription: "",
        notes: "",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        heart_rate: "",
        temperature: "",
        weight: "",
        height: "",
        blood_sugar: "",
        cholesterol: "",
        doctor_name: ""
      });
    } catch (err) {
      console.error("Error creating medical record:", err);
      setError(err instanceof Error ? err.message : "Failed to create medical record");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black">Add Medical Record</h2>
                <p className="text-sm text-black">Record patient visit and examination details</p>
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

          {/* Visit Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-black border-b border-gray-100 pb-2">Visit Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Visit Date *
                </label>
                <input
                  type="date"
                  name="visit_date"
                  value={formData.visit_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
                />
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
                  placeholder="e.g., Dr. Smith"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Chief Complaint
              </label>
              <textarea
                name="chief_complaint"
                value={formData.chief_complaint}
                onChange={handleChange}
                placeholder="Patient's main reason for visit..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
              />
            </div>
          </div>

          {/* Clinical Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-black border-b border-gray-100 pb-2">Clinical Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Diagnosis
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Medical diagnosis and assessment..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Prescription
              </label>
              <textarea
                name="prescription"
                value={formData.prescription}
                onChange={handleChange}
                placeholder="Medications and treatment plan..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional clinical notes..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
              />
            </div>
          </div>

          {/* Vital Signs */}
          <div className="space-y-4">
            <h3 className="font-medium text-black border-b border-gray-100 pb-2">Vital Signs</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Blood Pressure (Systolic)
                </label>
                <input
                  type="number"
                  name="blood_pressure_systolic"
                  value={formData.blood_pressure_systolic}
                  onChange={handleChange}
                  placeholder="120"
                  min="60"
                  max="250"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Blood Pressure (Diastolic)
                </label>
                <input
                  type="number"
                  name="blood_pressure_diastolic"
                  value={formData.blood_pressure_diastolic}
                  onChange={handleChange}
                  placeholder="80"
                  min="40"
                  max="150"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  name="heart_rate"
                  value={formData.heart_rate}
                  onChange={handleChange}
                  placeholder="72"
                  min="30"
                  max="200"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="98.6"
                  step="0.1"
                  min="95"
                  max="110"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="150"
                  step="0.1"
                  min="50"
                  max="500"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Height (inches)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="70"
                  step="0.1"
                  min="24"
                  max="96"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Blood Sugar (mg/dL)
                </label>
                <input
                  type="number"
                  name="blood_sugar"
                  value={formData.blood_sugar}
                  onChange={handleChange}
                  placeholder="100"
                  min="50"
                  max="500"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Cholesterol (mg/dL)
                </label>
                <input
                  type="number"
                  name="cholesterol"
                  value={formData.cholesterol}
                  onChange={handleChange}
                  placeholder="200"
                  min="100"
                  max="400"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black dark:text-black dark:bg-white/90"
                />
              </div>
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4" />
                  <span>Create Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
