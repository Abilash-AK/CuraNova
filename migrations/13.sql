
-- Create patient sessions table for MRN-based login
CREATE TABLE IF NOT EXISTS patient_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_token TEXT UNIQUE NOT NULL,
  patient_id INTEGER NOT NULL,
  medical_record_number TEXT NOT NULL,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for patient sessions
CREATE INDEX IF NOT EXISTS idx_patient_sessions_token ON patient_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_patient_sessions_mrn ON patient_sessions(medical_record_number);

-- Insert sample patients for testing (only if they don't exist)
INSERT OR IGNORE INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, medical_record_number, blood_type, allergies, emergency_contact_name, emergency_contact_phone, current_doctor_name) VALUES
('John', 'Doe', 'john.doe@email.com', '(555) 123-4567', '1985-03-15', 'Male', '123 Main St, Anytown, ST 12345', 'MRN001', 'A+', 'Penicillin', 'Jane Doe', '(555) 123-4568', 'Dr. Smith'),
('Sarah', 'Johnson', 'sarah.j@email.com', '(555) 234-5678', '1990-07-22', 'Female', '456 Oak Ave, Somewhere, ST 23456', 'MRN002', 'O-', 'None known', 'Mike Johnson', '(555) 234-5679', 'Dr. Williams'),
('Michael', 'Brown', 'mbrown@email.com', '(555) 345-6789', '1978-11-08', 'Male', '789 Pine Rd, Elsewhere, ST 34567', 'MRN003', 'B+', 'Shellfish, Latex', 'Lisa Brown', '(555) 345-6790', 'Dr. Davis');

-- Insert sample medical records
INSERT OR IGNORE INTO medical_records (patient_id, visit_date, chief_complaint, diagnosis, prescription, notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, doctor_name) VALUES
(1, '2024-01-15', 'Annual checkup', 'Healthy adult physical', 'Multivitamin daily', 'Patient reports feeling well. All vitals normal.', 120, 80, 72, 98.6, 'Dr. Smith'),
(1, '2023-08-22', 'Sore throat', 'Viral pharyngitis', 'Rest and fluids', 'Mild viral infection, should resolve in 5-7 days.', 118, 78, 75, 99.2, 'Dr. Smith'),
(2, '2024-02-10', 'Routine physical', 'Annual wellness visit', 'Continue current medications', 'Patient in good health. Recommended annual mammogram.', 115, 75, 68, 98.4, 'Dr. Williams'),
(3, '2024-01-08', 'Back pain', 'Lower back strain', 'Ibuprofen 400mg TID, Physical therapy', 'Patient reports lifting heavy object. Muscle strain likely.', 125, 82, 78, 98.8, 'Dr. Davis');

-- Insert sample lab results
INSERT OR IGNORE INTO lab_results (patient_id, test_name, test_value, test_unit, reference_range, test_date, is_abnormal, doctor_name) VALUES
(1, 'Total Cholesterol', '185', 'mg/dL', '<200', '2024-01-15', 0, 'Dr. Smith'),
(1, 'HDL Cholesterol', '55', 'mg/dL', '>40', '2024-01-15', 0, 'Dr. Smith'),
(1, 'LDL Cholesterol', '110', 'mg/dL', '<100', '2024-01-15', 1, 'Dr. Smith'),
(2, 'Hemoglobin A1C', '5.2', '%', '<5.7', '2024-02-10', 0, 'Dr. Williams'),
(2, 'Vitamin D', '32', 'ng/mL', '30-100', '2024-02-10', 0, 'Dr. Williams'),
(3, 'Complete Blood Count', 'Normal', '', 'Normal ranges', '2024-01-08', 0, 'Dr. Davis');
