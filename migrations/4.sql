-- Insert test patients with the actual user ID from the first patient
INSERT INTO patients (
  user_id, first_name, last_name, email, phone, date_of_birth, gender,
  address, medical_record_number, blood_type, allergies, 
  emergency_contact_name, emergency_contact_phone
) VALUES 
(
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Emily', 'Rodriguez', 'emily.rodriguez@email.com', '(555) 123-4567',
  '1985-03-15', 'Female', '789 Elm Street, Boston, MA 02101',
  'MRN-2024-001', 'A+', 'Penicillin, Peanuts',
  'Carlos Rodriguez', '(555) 123-4568'
),
(
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'David', 'Kim', 'david.kim@email.com', '(555) 234-5678',
  '1978-11-22', 'Male', '456 Pine Avenue, Seattle, WA 98101',
  'MRN-2024-002', 'O+', 'Latex, Sulfa drugs',
  'Sarah Kim', '(555) 234-5679'
),
(
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Lisa', 'Thompson', 'lisa.thompson@email.com', '(555) 345-6789',
  '1990-07-10', 'Female', '123 Cedar Road, Austin, TX 73301',
  'MRN-2024-003', 'B-', 'Aspirin, Shellfish',
  'Mark Thompson', '(555) 345-6790'
);

-- Insert medical records for Emily Rodriguez
INSERT INTO medical_records (
  patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription,
  notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
  temperature, weight, height, blood_sugar, cholesterol
) VALUES 
(
  (SELECT id FROM patients WHERE first_name = 'Emily' AND last_name = 'Rodriguez' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  '2024-09-01', 'Annual physical exam', 'Hypertension, well controlled',
  'Lisinopril 10mg daily, continue current dose',
  'Patient reports good medication compliance. Blood pressure well controlled. Recommends continued monitoring.',
  128, 82, 72, 98.6, 165, 66, 95, 198
),
(
  (SELECT id FROM patients WHERE first_name = 'Emily' AND last_name = 'Rodriguez' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  '2024-06-15', 'Follow-up for hypertension', 'Hypertension, stable',
  'Continue Lisinopril 10mg daily',
  'Blood pressure readings have improved. Patient maintaining healthy diet and exercise routine.',
  122, 78, 68, 98.4, 163, 66, 88, 185
);

-- Insert medical records for David Kim
INSERT INTO medical_records (
  patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription,
  notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
  temperature, weight, height, blood_sugar, cholesterol
) VALUES 
(
  (SELECT id FROM patients WHERE first_name = 'David' AND last_name = 'Kim' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  '2024-08-20', 'Diabetes management follow-up', 'Type 2 Diabetes Mellitus, well controlled',
  'Metformin 1000mg twice daily, Glipizide 5mg daily',
  'Excellent glucose control. HbA1c improved. Continue current regimen with quarterly monitoring.',
  118, 76, 74, 98.2, 185, 70, 112, 165
),
(
  (SELECT id FROM patients WHERE first_name = 'David' AND last_name = 'Kim' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  '2024-05-10', 'Routine diabetes check', 'Type 2 Diabetes Mellitus',
  'Adjusted Metformin to 1000mg twice daily',
  'Glucose levels slightly elevated. Increased Metformin dose. Dietary counseling provided.',
  125, 80, 78, 98.8, 188, 70, 145, 210
);

-- Insert medical records for Lisa Thompson
INSERT INTO medical_records (
  patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription,
  notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
  temperature, weight, height, blood_sugar, cholesterol
) VALUES 
(
  (SELECT id FROM patients WHERE first_name = 'Lisa' AND last_name = 'Thompson' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  '2024-09-10', 'Pregnancy follow-up', 'Pregnancy, 28 weeks gestation, normal',
  'Prenatal vitamins, Iron supplement 65mg daily',
  '28-week prenatal visit. All parameters normal. Glucose tolerance test scheduled.',
  108, 68, 82, 98.4, 142, 64, 85, 165
),
(
  (SELECT id FROM patients WHERE first_name = 'Lisa' AND last_name = 'Thompson' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  '2024-07-15', 'Pregnancy follow-up', 'Pregnancy, 20 weeks gestation, normal',
  'Prenatal vitamins, continue current regimen',
  '20-week anatomy scan normal. Patient feeling well. Continue routine prenatal care.',
  112, 70, 78, 98.6, 138, 64, 82, 155
);

-- Insert lab results for Emily Rodriguez
INSERT INTO lab_results (
  patient_id, user_id, test_name, test_value, test_unit,
  reference_range, test_date, is_abnormal
) VALUES 
(
  (SELECT id FROM patients WHERE first_name = 'Emily' AND last_name = 'Rodriguez' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Complete Blood Count - Hemoglobin', '13.2', 'g/dL', '12.0-15.5', '2024-09-01', 0
),
(
  (SELECT id FROM patients WHERE first_name = 'Emily' AND last_name = 'Rodriguez' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Basic Metabolic Panel - Glucose', '95', 'mg/dL', '70-99', '2024-09-01', 0
),
(
  (SELECT id FROM patients WHERE first_name = 'Emily' AND last_name = 'Rodriguez' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Lipid Panel - Total Cholesterol', '198', 'mg/dL', '<200', '2024-09-01', 0
),
(
  (SELECT id FROM patients WHERE first_name = 'Emily' AND last_name = 'Rodriguez' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Lipid Panel - LDL Cholesterol', '125', 'mg/dL', '<100', '2024-09-01', 1
),
(
  (SELECT id FROM patients WHERE first_name = 'Emily' AND last_name = 'Rodriguez' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Thyroid Function - TSH', '2.1', 'mU/L', '0.4-4.0', '2024-09-01', 0
);

-- Insert lab results for David Kim
INSERT INTO lab_results (
  patient_id, user_id, test_name, test_value, test_unit,
  reference_range, test_date, is_abnormal
) VALUES 
(
  (SELECT id FROM patients WHERE first_name = 'David' AND last_name = 'Kim' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Hemoglobin A1C', '6.8', '%', '<7.0', '2024-08-20', 0
),
(
  (SELECT id FROM patients WHERE first_name = 'David' AND last_name = 'Kim' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Fasting Glucose', '112', 'mg/dL', '70-99', '2024-08-20', 1
),
(
  (SELECT id FROM patients WHERE first_name = 'David' AND last_name = 'Kim' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Kidney Function - Creatinine', '1.0', 'mg/dL', '0.7-1.3', '2024-08-20', 0
),
(
  (SELECT id FROM patients WHERE first_name = 'David' AND last_name = 'Kim' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Lipid Panel - HDL Cholesterol', '48', 'mg/dL', '>40', '2024-08-20', 0
),
(
  (SELECT id FROM patients WHERE first_name = 'David' AND last_name = 'Kim' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Microalbumin', '15', 'mg/g', '<30', '2024-08-20', 0
);

-- Insert lab results for Lisa Thompson
INSERT INTO lab_results (
  patient_id, user_id, test_name, test_value, test_unit,
  reference_range, test_date, is_abnormal
) VALUES 
(
  (SELECT id FROM patients WHERE first_name = 'Lisa' AND last_name = 'Thompson' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Prenatal Panel - Hemoglobin', '11.8', 'g/dL', '11.0-14.0', '2024-09-10', 0
),
(
  (SELECT id FROM patients WHERE first_name = 'Lisa' AND last_name = 'Thompson' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Glucose Tolerance Test - 1 hour', '142', 'mg/dL', '<140', '2024-09-10', 1
),
(
  (SELECT id FROM patients WHERE first_name = 'Lisa' AND last_name = 'Thompson' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Iron Studies - Ferritin', '45', 'ng/mL', '12-150', '2024-09-10', 0
),
(
  (SELECT id FROM patients WHERE first_name = 'Lisa' AND last_name = 'Thompson' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Urine Protein', 'Trace', '', 'Negative/Trace', '2024-09-10', 0
),
(
  (SELECT id FROM patients WHERE first_name = 'Lisa' AND last_name = 'Thompson' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'),
  '01995c67-a41a-7dde-842d-2b7475566a64',
  'Group B Strep Culture', 'Negative', '', 'Negative', '2024-09-10', 0
);