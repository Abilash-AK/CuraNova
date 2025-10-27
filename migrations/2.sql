
INSERT INTO patients (
  user_id, first_name, last_name, email, phone, date_of_birth, gender,
  address, medical_record_number, blood_type, allergies, 
  emergency_contact_name, emergency_contact_phone
) VALUES 
(
  'test-user-1', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '+1-555-0123', 
  '1985-03-15', 'Female', '123 Oak Street, Springfield, IL 62701', 'MRN001', 'A+',
  'Penicillin, Shellfish', 'John Johnson', '+1-555-0124'
),
(
  'test-user-1', 'Michael', 'Chen', 'michael.chen@email.com', '+1-555-0125',
  '1978-08-22', 'Male', '456 Maple Avenue, Springfield, IL 62702', 'MRN002', 'O-',
  'None known', 'Lisa Chen', '+1-555-0126'
);

INSERT INTO medical_records (
  patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription,
  notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
  temperature, weight, height
) VALUES 
(
  1, 'test-user-1', '2024-01-15', 'Annual checkup', 'Hypertension, stage 1',
  'Lisinopril 10mg daily', 'Patient reports feeling well. BP slightly elevated.',
  145, 92, 78, 98.6, 155, 65
),
(
  1, 'test-user-1', '2024-02-20', 'Follow-up for hypertension', 'Hypertension, controlled',
  'Continue Lisinopril 10mg daily', 'BP improved with medication compliance.',
  132, 85, 74, 98.4, 153, 65
),
(
  2, 'test-user-1', '2024-01-22', 'Fatigue and weakness', 'Iron deficiency anemia',
  'Ferrous sulfate 325mg twice daily', 'Patient reports chronic fatigue. Lab results show low hemoglobin.',
  118, 75, 82, 99.1, 175, 70
);

INSERT INTO lab_results (
  patient_id, user_id, test_name, test_value, test_unit, reference_range,
  test_date, is_abnormal
) VALUES 
(
  1, 'test-user-1', 'Hemoglobin A1C', '5.8', '%', '4.0-5.6', '2024-01-15', 1
),
(
  1, 'test-user-1', 'Total Cholesterol', '195', 'mg/dL', '<200', '2024-01-15', 0
),
(
  1, 'test-user-1', 'LDL Cholesterol', '125', 'mg/dL', '<100', '2024-01-15', 1
),
(
  2, 'test-user-1', 'Hemoglobin', '9.2', 'g/dL', '12.0-15.5', '2024-01-22', 1
),
(
  2, 'test-user-1', 'Iron', '45', 'μg/dL', '60-170', '2024-01-22', 1
),
(
  2, 'test-user-1', 'Ferritin', '12', 'ng/mL', '15-150', '2024-01-22', 1
);
