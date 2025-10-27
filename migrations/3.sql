
-- Insert 3 comprehensive test patients
INSERT INTO patients (
  user_id, first_name, last_name, email, phone, date_of_birth, gender,
  address, medical_record_number, blood_type, allergies, 
  emergency_contact_name, emergency_contact_phone
) VALUES 
-- Patient 1: Emily Rodriguez - Young diabetic patient
('test-user-1', 'Emily', 'Rodriguez', 'emily.rodriguez@email.com', '(555) 123-4567', 
 '1996-03-15', 'Female', '1234 Maple Street, Springfield, IL 62701', 'MRN-001234',
 'O+', 'Penicillin, Shellfish', 'Carlos Rodriguez', '(555) 123-4568'),

-- Patient 2: Robert Thompson - Older male with cardiovascular issues
('test-user-1', 'Robert', 'Thompson', 'robert.thompson@email.com', '(555) 234-5678',
 '1959-08-22', 'Male', '5678 Oak Avenue, Chicago, IL 60601', 'MRN-002345', 
 'B+', 'Aspirin, Latex', 'Margaret Thompson', '(555) 234-5679'),

-- Patient 3: Maria Silva - Middle-aged with thyroid condition
('test-user-1', 'Maria', 'Silva', 'maria.silva@email.com', '(555) 345-6789',
 '1979-11-08', 'Female', '9012 Pine Boulevard, Miami, FL 33101', 'MRN-003456',
 'A-', 'Iodine, Codeine', 'Juan Silva', '(555) 345-6790');

-- Insert comprehensive medical records for Emily Rodriguez (Patient ID 1)
INSERT INTO medical_records (
  patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription, notes,
  blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, height,
  blood_sugar, cholesterol
) VALUES 
(1, 'test-user-1', '2024-09-10', 'Routine diabetes follow-up', 'Type 1 Diabetes Mellitus', 
 'Insulin Humalog 15 units TID, Metformin 500mg BID', 
 'Patient reports good glucose control. Discussed carb counting. A1C due next visit.',
 118, 76, 72, 98.6, 135.2, 65.5, 145, 180),

(1, 'test-user-1', '2024-08-05', 'Fatigue and frequent urination', 'Hyperglycemia', 
 'Adjusted insulin dose to 18 units TID', 
 'Blood sugar elevated. Discussed stress management and exercise routine.',
 122, 78, 78, 99.1, 134.8, 65.5, 285, NULL),

(1, 'test-user-1', '2024-06-15', 'Annual physical exam', 'Type 1 DM - well controlled', 
 'Continue current medications', 
 'Annual eye exam scheduled. Foot exam normal. Patient doing well overall.',
 115, 74, 68, 98.4, 133.5, 65.0, 125, 165);

-- Insert medical records for Robert Thompson (Patient ID 2)
INSERT INTO medical_records (
  patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription, notes,
  blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, height,
  blood_sugar, cholesterol
) VALUES 
(2, 'test-user-1', '2024-09-08', 'Chest pain and shortness of breath', 'Unstable Angina', 
 'Lisinopril 10mg daily, Atorvastatin 40mg daily, Clopidogrel 75mg daily',
 'Referred to cardiology. Stress test scheduled. Patient educated on chest pain protocol.',
 165, 95, 88, 98.2, 195.5, 70.0, 110, 245),

(2, 'test-user-1', '2024-07-20', 'Hypertension follow-up', 'Essential Hypertension', 
 'Increased Lisinopril to 15mg daily', 
 'Blood pressure still elevated. Discussed DASH diet and exercise modifications.',
 158, 92, 82, 98.8, 194.2, 70.0, 95, 220),

(2, 'test-user-1', '2024-05-10', 'Routine cardiovascular check', 'HTN, Hyperlipidemia', 
 'Lisinopril 10mg daily, Atorvastatin 20mg daily',
 'EKG normal. Continue lifestyle modifications. Recheck lipids in 3 months.',
 145, 88, 75, 98.5, 192.8, 70.0, 88, 201);

-- Insert medical records for Maria Silva (Patient ID 3)
INSERT INTO medical_records (
  patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription, notes,
  blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, height,
  blood_sugar, cholesterol
) VALUES 
(3, 'test-user-1', '2024-09-12', 'Thyroid medication adjustment', 'Hypothyroidism', 
 'Levothyroxine 100mcg daily', 
 'TSH levels improving. Patient reports increased energy. Continue current dose.',
 128, 82, 65, 98.7, 158.3, 64.0, 92, 190),

(3, 'test-user-1', '2024-07-25', 'Fatigue and weight gain', 'Hypothyroidism', 
 'Increased Levothyroxine to 100mcg daily', 
 'TSH elevated. Increased medication dose. Recheck in 6 weeks.',
 132, 84, 62, 98.9, 162.1, 64.0, 85, 205),

(3, 'test-user-1', '2024-04-18', 'Hair loss and cold intolerance', 'Newly diagnosed Hypothyroidism', 
 'Started Levothyroxine 75mcg daily', 
 'New diagnosis based on symptoms and lab results. Patient education provided.',
 130, 85, 58, 98.3, 165.7, 64.0, 78, 215);

-- Insert comprehensive lab results for Emily Rodriguez
INSERT INTO lab_results (
  patient_id, user_id, test_name, test_value, test_unit, reference_range, test_date, is_abnormal
) VALUES 
(1, 'test-user-1', 'HbA1c', '7.2', '%', '4.0-5.6', '2024-09-10', 1),
(1, 'test-user-1', 'Fasting Glucose', '145', 'mg/dL', '70-100', '2024-09-10', 1),
(1, 'test-user-1', 'Total Cholesterol', '180', 'mg/dL', '<200', '2024-09-10', 0),
(1, 'test-user-1', 'HDL Cholesterol', '58', 'mg/dL', '>40', '2024-09-10', 0),
(1, 'test-user-1', 'LDL Cholesterol', '105', 'mg/dL', '<100', '2024-09-10', 1),
(1, 'test-user-1', 'Triglycerides', '85', 'mg/dL', '<150', '2024-09-10', 0),
(1, 'test-user-1', 'Microalbumin', '25', 'mg/g creatinine', '<30', '2024-09-10', 0),
(1, 'test-user-1', 'HbA1c', '8.1', '%', '4.0-5.6', '2024-06-15', 1),
(1, 'test-user-1', 'C-Peptide', '0.8', 'ng/mL', '1.1-4.4', '2024-06-15', 1);

-- Insert lab results for Robert Thompson
INSERT INTO lab_results (
  patient_id, user_id, test_name, test_value, test_unit, reference_range, test_date, is_abnormal
) VALUES 
(2, 'test-user-1', 'Total Cholesterol', '245', 'mg/dL', '<200', '2024-09-08', 1),
(2, 'test-user-1', 'LDL Cholesterol', '165', 'mg/dL', '<100', '2024-09-08', 1),
(2, 'test-user-1', 'HDL Cholesterol', '35', 'mg/dL', '>40', '2024-09-08', 1),
(2, 'test-user-1', 'Triglycerides', '225', 'mg/dL', '<150', '2024-09-08', 1),
(2, 'test-user-1', 'Troponin I', '0.02', 'ng/mL', '<0.04', '2024-09-08', 0),
(2, 'test-user-1', 'BNP', '125', 'pg/mL', '<100', '2024-09-08', 1),
(2, 'test-user-1', 'Creatinine', '1.2', 'mg/dL', '0.7-1.3', '2024-09-08', 0),
(2, 'test-user-1', 'eGFR', '68', 'mL/min/1.73m²', '>60', '2024-09-08', 1),
(2, 'test-user-1', 'Hemoglobin', '13.8', 'g/dL', '14.0-17.5', '2024-07-20', 1),
(2, 'test-user-1', 'Total Cholesterol', '220', 'mg/dL', '<200', '2024-05-10', 1);

-- Insert lab results for Maria Silva
INSERT INTO lab_results (
  patient_id, user_id, test_name, test_value, test_unit, reference_range, test_date, is_abnormal
) VALUES 
(3, 'test-user-1', 'TSH', '4.2', 'mIU/L', '0.4-4.0', '2024-09-12', 1),
(3, 'test-user-1', 'Free T4', '1.1', 'ng/dL', '0.8-1.8', '2024-09-12', 0),
(3, 'test-user-1', 'Free T3', '2.8', 'pg/mL', '2.3-4.2', '2024-09-12', 0),
(3, 'test-user-1', 'TPO Antibodies', '85', 'IU/mL', '<35', '2024-09-12', 1),
(3, 'test-user-1', 'Total Cholesterol', '190', 'mg/dL', '<200', '2024-09-12', 0),
(3, 'test-user-1', 'Vitamin D', '28', 'ng/mL', '30-100', '2024-09-12', 1),
(3, 'test-user-1', 'TSH', '8.5', 'mIU/L', '0.4-4.0', '2024-07-25', 1),
(3, 'test-user-1', 'Free T4', '0.7', 'ng/dL', '0.8-1.8', '2024-07-25', 1),
(3, 'test-user-1', 'TSH', '12.8', 'mIU/L', '0.4-4.0', '2024-04-18', 1),
(3, 'test-user-1', 'Free T4', '0.5', 'ng/dL', '0.8-1.8', '2024-04-18', 1),
(3, 'test-user-1', 'Anti-Thyroglobulin', '45', 'IU/mL', '<20', '2024-04-18', 1);
