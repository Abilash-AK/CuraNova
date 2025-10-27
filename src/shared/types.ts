import z from "zod";

export const PatientSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().optional().refine((val) => !val || val === "" || z.string().email().safeParse(val).success, {
    message: "Invalid email format"
  }),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  address: z.string().optional(),
  medical_record_number: z.string().optional(),
  blood_type: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  allergies: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  current_doctor_name: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const MedicalRecordSchema = z.object({
  id: z.number().optional(),
  patient_id: z.number(),
  user_id: z.string(),
  visit_date: z.string(),
  chief_complaint: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  blood_pressure_systolic: z.number().optional(),
  blood_pressure_diastolic: z.number().optional(),
  heart_rate: z.number().optional(),
  temperature: z.number().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  blood_sugar: z.number().optional(),
  cholesterol: z.number().optional(),
  doctor_name: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const LabResultSchema = z.object({
  id: z.number().optional(),
  patient_id: z.number(),
  user_id: z.string(),
  test_name: z.string().min(1, "Test name is required"),
  test_value: z.string().min(1, "Test value is required"),
  test_unit: z.string().optional(),
  reference_range: z.string().optional(),
  test_date: z.string(),
  is_abnormal: z.boolean().optional(),
  doctor_name: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Patient = z.infer<typeof PatientSchema>;
export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;
export type LabResult = z.infer<typeof LabResultSchema>;

export interface PatientWithRecords extends Patient {
  medical_records?: MedicalRecord[];
  lab_results?: LabResult[];
}

export interface DashboardStats {
  total_patients: number;
  recent_visits: number;
  doctors_online: number;
}
