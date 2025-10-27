
-- Insert 10 dummy patients with comprehensive medical data
INSERT INTO patients (user_id, first_name, last_name, email, phone, date_of_birth, gender, address, medical_record_number, blood_type, allergies, emergency_contact_name, emergency_contact_phone, created_at) VALUES
('hospital', 'John', 'Smith', 'john.smith@email.com', '555-0101', '1985-03-15', 'Male', '123 Main St, Anytown, ST 12345', 'MRN001', 'A+', 'Penicillin', 'Jane Smith', '555-0102', datetime('now', '-30 days')),
('hospital', 'Emily', 'Johnson', 'emily.j@email.com', '555-0201', '1992-07-22', 'Female', '456 Oak Ave, Springfield, ST 67890', 'MRN002', 'B-', 'None', 'Michael Johnson', '555-0202', datetime('now', '-25 days')),
('hospital', 'Michael', 'Brown', 'mbrown@email.com', '555-0301', '1978-11-08', 'Male', '789 Pine Rd, Riverside, ST 11111', 'MRN003', 'O+', 'Shellfish, Latex', 'Sarah Brown', '555-0302', datetime('now', '-20 days')),
('hospital', 'Sarah', 'Davis', 'sarah.davis@email.com', '555-0401', '1990-05-14', 'Female', '321 Elm St, Hillside, ST 22222', 'MRN004', 'AB+', 'None', 'David Davis', '555-0402', datetime('now', '-18 days')),
('hospital', 'Robert', 'Wilson', 'rwilson@email.com', '555-0501', '1965-09-30', 'Male', '654 Maple Dr, Laketown, ST 33333', 'MRN005', 'A-', 'Aspirin, Sulfa drugs', 'Linda Wilson', '555-0502', datetime('now', '-15 days')),
('hospital', 'Jessica', 'Martinez', 'jessica.m@email.com', '555-0601', '1987-12-03', 'Female', '987 Cedar Ln, Mountainview, ST 44444', 'MRN006', 'O-', 'Iodine', 'Carlos Martinez', '555-0602', datetime('now', '-12 days')),
('hospital', 'David', 'Garcia', 'dgarcia@email.com', '555-0701', '1995-01-18', 'Male', '147 Birch St, Seaside, ST 55555', 'MRN007', 'B+', 'None', 'Maria Garcia', '555-0702', datetime('now', '-10 days')),
('hospital', 'Lisa', 'Anderson', 'lisa.anderson@email.com', '555-0801', '1982-06-25', 'Female', '258 Spruce Ave, Desert View, ST 66666', 'MRN008', 'AB-', 'Codeine, Morphine', 'James Anderson', '555-0802', datetime('now', '-8 days')),
('hospital', 'Christopher', 'Taylor', 'ctaylor@email.com', '555-0901', '1973-04-12', 'Male', '369 Walnut Blvd, Forest Glen, ST 77777', 'MRN009', 'A+', 'Eggs, Dairy', 'Nancy Taylor', '555-0902', datetime('now', '-5 days')),
('hospital', 'Amanda', 'Thomas', 'amanda.thomas@email.com', '555-1001', '1988-10-07', 'Female', '741 Ash Ct, Valley Springs, ST 88888', 'MRN010', 'O+', 'None', 'Kevin Thomas', '555-1002', datetime('now', '-3 days'));

-- Insert medical records for the dummy patients
INSERT INTO medical_records (patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription, notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, height, created_at) VALUES
(1, 'doctor01', datetime('now', '-5 days'), 'Annual physical exam', 'Healthy adult male', 'None', 'Patient reports feeling well. Continue regular exercise routine.', 120, 80, 72, 98.6, 180, 72, datetime('now', '-5 days')),
(2, 'doctor02', datetime('now', '-3 days'), 'Headache and fatigue', 'Tension headache', 'Ibuprofen 400mg PRN', 'Stress-related symptoms. Recommend stress management techniques.', 115, 75, 68, 98.4, 125, 65, datetime('now', '-3 days')),
(3, 'nurse01', datetime('now', '-7 days'), 'Follow-up diabetes check', 'Type 2 Diabetes Mellitus', 'Metformin 500mg BID', 'Blood sugar levels improving. Continue current medication.', 140, 90, 78, 98.7, 190, 69, datetime('now', '-7 days')),
(4, 'doctor01', datetime('now', '-2 days'), 'Pregnancy checkup', 'Normal pregnancy - 28 weeks', 'Prenatal vitamins', 'Fetal development normal. Next appointment in 2 weeks.', 110, 70, 75, 98.5, 145, 64, datetime('now', '-2 days')),
(5, 'doctor03', datetime('now', '-10 days'), 'Chest pain evaluation', 'Stable angina', 'Atorvastatin 20mg daily, Aspirin 81mg daily', 'EKG shows minor changes. Schedule stress test.', 150, 95, 85, 98.8, 210, 70, datetime('now', '-10 days')),
(6, 'nurse02', datetime('now', '-1 day'), 'Vaccination appointment', 'Immunization update', 'Tdap vaccine administered', 'Patient up to date on all vaccinations.', 118, 78, 70, 98.3, 135, 62, datetime('now', '-1 day')),
(7, 'doctor02', datetime('now', '-6 days'), 'Sports injury follow-up', 'Sprained ankle - healing', 'Continue physical therapy', 'Range of motion improving. Return to activities gradually.', 125, 82, 74, 98.9, 165, 68, datetime('now', '-6 days')),
(8, 'doctor01', datetime('now', '-4 days'), 'Anxiety and insomnia', 'Generalized anxiety disorder', 'Sertraline 50mg daily', 'Symptoms improving with medication. Continue therapy sessions.', 130, 85, 88, 98.2, 140, 66, datetime('now', '-4 days')),
(9, 'doctor03', datetime('now', '-8 days'), 'Hypertension management', 'Essential hypertension', 'Lisinopril 10mg daily', 'Blood pressure well controlled. Continue current regimen.', 128, 84, 76, 98.5, 195, 71, datetime('now', '-8 days')),
(10, 'nurse01', datetime('now', '-1 day'), 'Routine wellness visit', 'General health maintenance', 'Multivitamin daily', 'Overall health excellent. Maintain healthy lifestyle.', 112, 72, 65, 98.4, 130, 63, datetime('now', '-1 day'));

-- Insert lab results for the dummy patients
INSERT INTO lab_results (patient_id, user_id, test_name, test_value, test_unit, reference_range, test_date, is_abnormal, created_at) VALUES
(1, 'lab-tech', 'Complete Blood Count', '5.2', 'x10^3/μL', '4.5-11.0', datetime('now', '-5 days'), 0, datetime('now', '-5 days')),
(1, 'lab-tech', 'Cholesterol Total', '185', 'mg/dL', '<200', datetime('now', '-5 days'), 0, datetime('now', '-5 days')),
(2, 'lab-tech', 'Hemoglobin', '12.8', 'g/dL', '12.0-15.0', datetime('now', '-3 days'), 0, datetime('now', '-3 days')),
(3, 'lab-tech', 'Glucose Fasting', '145', 'mg/dL', '70-99', datetime('now', '-7 days'), 1, datetime('now', '-7 days')),
(3, 'lab-tech', 'HbA1c', '7.2', '%', '<5.7', datetime('now', '-7 days'), 1, datetime('now', '-7 days')),
(4, 'lab-tech', 'Glucose Screening', '128', 'mg/dL', '<140', datetime('now', '-2 days'), 0, datetime('now', '-2 days')),
(5, 'lab-tech', 'Troponin I', '0.02', 'ng/mL', '<0.04', datetime('now', '-10 days'), 0, datetime('now', '-10 days')),
(5, 'lab-tech', 'LDL Cholesterol', '165', 'mg/dL', '<100', datetime('now', '-10 days'), 1, datetime('now', '-10 days')),
(6, 'lab-tech', 'CBC with Differential', '6.8', 'x10^3/μL', '4.5-11.0', datetime('now', '-1 day'), 0, datetime('now', '-1 day')),
(7, 'lab-tech', 'C-Reactive Protein', '2.1', 'mg/L', '<3.0', datetime('now', '-6 days'), 0, datetime('now', '-6 days')),
(8, 'lab-tech', 'Thyroid Stimulating Hormone', '2.8', 'mIU/L', '0.4-4.0', datetime('now', '-4 days'), 0, datetime('now', '-4 days')),
(9, 'lab-tech', 'Creatinine', '1.1', 'mg/dL', '0.7-1.3', datetime('now', '-8 days'), 0, datetime('now', '-8 days')),
(10, 'lab-tech', 'Lipid Panel', '175', 'mg/dL', '<200', datetime('now', '-1 day'), 0, datetime('now', '-1 day'));
