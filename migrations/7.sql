
ALTER TABLE patients ADD COLUMN current_doctor_name TEXT;
ALTER TABLE medical_records ADD COLUMN doctor_name TEXT;
ALTER TABLE lab_results ADD COLUMN doctor_name TEXT;
