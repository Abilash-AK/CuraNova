
-- Insert more patients with similar conditions for better similar cases functionality

-- Hypertension and Diabetes patients
INSERT INTO patients (user_id, first_name, last_name, email, phone, date_of_birth, gender, blood_type, allergies, address, medical_record_number) VALUES
('system', 'Robert', 'Johnson', 'robert.j@email.com', '555-0201', '1968-03-15', 'Male', 'O+', 'None', '456 Oak Street', 'MRN-010'),
('system', 'Linda', 'Williams', 'linda.w@email.com', '555-0202', '1965-08-22', 'Female', 'A-', 'Penicillin', '789 Pine Avenue', 'MRN-011'),
('system', 'David', 'Brown', 'david.b@email.com', '555-0203', '1970-11-08', 'Male', 'B+', 'None', '321 Elm Drive', 'MRN-012');

-- Cardiovascular conditions patients
INSERT INTO patients (user_id, first_name, last_name, email, phone, date_of_birth, gender, blood_type, allergies, address, medical_record_number) VALUES
('system', 'Karen', 'Davis', 'karen.d@email.com', '555-0204', '1962-05-30', 'Female', 'AB+', 'Shellfish', '654 Maple Lane', 'MRN-013'),
('system', 'Paul', 'Miller', 'paul.m@email.com', '555-0205', '1958-12-03', 'Male', 'O-', 'None', '987 Cedar Court', 'MRN-014'),
('system', 'Susan', 'Wilson', 'susan.w@email.com', '555-0206', '1975-09-18', 'Female', 'A+', 'Latex', '147 Birch Street', 'MRN-015');

-- Respiratory conditions patients
INSERT INTO patients (user_id, first_name, last_name, email, phone, date_of_birth, gender, blood_type, allergies, address, medical_record_number) VALUES
('system', 'Christopher', 'Moore', 'chris.m@email.com', '555-0207', '1985-01-25', 'Male', 'B-', 'Dust mites', '258 Spruce Road', 'MRN-016'),
('system', 'Jennifer', 'Taylor', 'jen.t@email.com', '555-0208', '1982-07-14', 'Female', 'O+', 'Pollen', '369 Willow Way', 'MRN-017'),
('system', 'Matthew', 'Anderson', 'matt.a@email.com', '555-0209', '1978-04-09', 'Male', 'A-', 'None', '741 Poplar Place', 'MRN-018');

-- Gastrointestinal conditions patient
INSERT INTO patients (user_id, first_name, last_name, email, phone, date_of_birth, gender, blood_type, allergies, address, medical_record_number) VALUES
('system', 'Patricia', 'Thomas', 'pat.t@email.com', '555-0210', '1972-10-12', 'Female', 'AB-', 'Dairy, Gluten', '852 Hickory Hill', 'MRN-019');

-- Medical records for Hypertension/Diabetes patients
INSERT INTO medical_records (patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription, notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, height, blood_sugar, cholesterol) VALUES
-- Robert Johnson (Hypertension + Diabetes)
(11, 'doctor1', '2024-08-15', 'Routine diabetes check', 'Type 2 Diabetes Mellitus, Hypertension', 'Metformin 1000mg BID, Lisinopril 10mg daily', 'Patient reports good compliance with medications. Blood sugar levels improving.', 148, 92, 78, 98.4, 185, 70, 165, 220),
(11, 'doctor1', '2024-07-01', 'Follow-up diabetes and BP', 'Type 2 Diabetes Mellitus, Hypertension', 'Continue current medications', 'Blood pressure still elevated. Increased exercise recommended.', 152, 95, 82, 98.2, 188, 70, 180, 235),
(11, 'doctor1', '2024-05-20', 'Initial diabetes diagnosis', 'Type 2 Diabetes Mellitus, newly diagnosed', 'Metformin 500mg BID', 'Patient education provided on diabetes management.', 145, 90, 76, 98.6, 190, 70, 195, 245),

-- Linda Williams (Diabetes + Neuropathy)
(12, 'doctor1', '2024-08-10', 'Diabetic neuropathy symptoms', 'Type 2 Diabetes with peripheral neuropathy', 'Metformin 1000mg BID, Gabapentin 300mg TID', 'Patient reports tingling in feet. Nerve conduction study ordered.', 138, 85, 72, 98.1, 165, 64, 155, 200),
(12, 'doctor1', '2024-06-25', 'Diabetes follow-up', 'Type 2 Diabetes Mellitus', 'Metformin 1000mg BID', 'Good glycemic control maintained.', 135, 82, 74, 98.3, 167, 64, 145, 195),

-- David Brown (Hypertension + High Cholesterol)
(13, 'doctor1', '2024-08-20', 'High blood pressure check', 'Essential Hypertension, Hyperlipidemia', 'Amlodipine 5mg daily, Atorvastatin 20mg daily', 'Blood pressure controlled with medication. Continue lifestyle modifications.', 128, 78, 68, 98.5, 175, 68, 110, 180),
(13, 'doctor1', '2024-07-05', 'Routine physical', 'Essential Hypertension', 'Amlodipine 5mg daily', 'Patient started on antihypertensive therapy.', 142, 88, 72, 98.4, 178, 68, 115, 240);

-- Medical records for Cardiovascular patients
INSERT INTO medical_records (patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription, notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, height, blood_sugar, cholesterol) VALUES
-- Karen Davis (Atrial Fibrillation)
(14, 'doctor1', '2024-08-25', 'Irregular heartbeat', 'Atrial Fibrillation', 'Warfarin 5mg daily, Metoprolol 50mg BID', 'INR monitoring required. Patient educated on signs of bleeding.', 135, 80, 88, 98.2, 155, 62, 105, 190),
(14, 'doctor1', '2024-07-15', 'Palpitations', 'Atrial Fibrillation, newly diagnosed', 'Metoprolol 25mg BID', 'EKG confirms atrial fibrillation. Cardiology referral made.', 142, 85, 95, 98.4, 158, 62, 110, 200),

-- Paul Miller (Heart Failure)
(15, 'doctor1', '2024-08-18', 'Shortness of breath', 'Congestive Heart Failure, NYHA Class II', 'Furosemide 40mg daily, Lisinopril 20mg daily', 'Fluid retention improved with diuretic therapy.', 125, 75, 65, 98.1, 180, 69, 120, 185),
(15, 'doctor1', '2024-06-30', 'Fatigue and swelling', 'Congestive Heart Failure', 'Furosemide 20mg daily, Lisinopril 10mg daily', 'Initial heart failure diagnosis. Echo shows reduced EF.', 140, 85, 70, 98.3, 185, 69, 125, 195),

-- Susan Wilson (Coronary Artery Disease)
(16, 'doctor1', '2024-08-12', 'Chest pain on exertion', 'Coronary Artery Disease, stable angina', 'Metoprolol 100mg BID, Atorvastatin 40mg daily', 'Stress test positive. Cardiac catheterization scheduled.', 132, 78, 62, 98.2, 145, 61, 95, 165),
(16, 'doctor1', '2024-07-20', 'Chest discomfort', 'Chest pain, rule out cardiac cause', 'Sublingual nitroglycerin PRN', 'EKG shows ST depression. Further cardiac workup needed.', 145, 88, 75, 98.4, 147, 61, 100, 220);

-- Medical records for Respiratory patients
INSERT INTO medical_records (patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription, notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, height, blood_sugar, cholesterol) VALUES
-- Christopher Moore (Asthma)
(17, 'doctor1', '2024-08-22', 'Asthma exacerbation', 'Asthma, moderate persistent', 'Albuterol inhaler PRN, Fluticasone 220mcg BID', 'Peak flow improved with treatment. Action plan reviewed.', 120, 75, 85, 98.3, 170, 71, 105, 175),
(17, 'doctor1', '2024-07-08', 'Wheezing and cough', 'Asthma, acute exacerbation', 'Prednisone 40mg daily x5 days, Albuterol q4h', 'Responded well to steroid therapy.', 125, 78, 88, 98.6, 168, 71, 110, 180),

-- Jennifer Taylor (COPD)
(18, 'doctor1', '2024-08-28', 'Increased dyspnea', 'COPD, moderate', 'Tiotropium daily, Albuterol/Ipratropium PRN', 'Pulmonary function tests show moderate obstruction.', 128, 80, 75, 98.1, 135, 59, 115, 190),
(18, 'doctor1', '2024-06-15', 'Chronic cough', 'COPD, newly diagnosed', 'Tiotropium daily', 'Smoking cessation counseling provided. Spirometry confirmed diagnosis.', 135, 82, 78, 98.4, 138, 59, 120, 200),

-- Matthew Anderson (Sleep Apnea)
(19, 'doctor1', '2024-08-05', 'Excessive daytime sleepiness', 'Obstructive Sleep Apnea', 'CPAP therapy initiated', 'Sleep study confirms severe OSA. CPAP compliance good.', 140, 85, 72, 98.2, 195, 72, 125, 210),
(19, 'doctor1', '2024-06-20', 'Snoring and fatigue', 'Sleep disorder, rule out sleep apnea', 'Sleep study ordered', 'Patient reports loud snoring and witnessed apneas.', 145, 88, 75, 98.5, 198, 72, 130, 220);

-- Medical records for Gastrointestinal patient
INSERT INTO medical_records (patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription, notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, height, blood_sugar, cholesterol) VALUES
-- Patricia Thomas (IBD)
(20, 'doctor1', '2024-08-30', 'Abdominal pain and diarrhea', 'Inflammatory Bowel Disease (Crohns)', 'Mesalamine 1200mg TID, Prednisone taper', 'Colonoscopy shows active inflammation. GI follow-up scheduled.', 125, 75, 68, 98.1, 125, 58, 100, 170),
(20, 'doctor1', '2024-07-10', 'Bloody stools', 'IBD flare', 'Mesalamine 800mg TID', 'Inflammatory markers elevated. Steroid therapy initiated.', 130, 78, 72, 98.8, 128, 58, 105, 175);

-- Lab results for new patients
INSERT INTO lab_results (patient_id, user_id, test_name, test_value, test_unit, reference_range, test_date, is_abnormal) VALUES
-- Diabetes-related labs
(11, 'doctor1', 'HbA1c', '7.2', '%', '4.0-5.6', '2024-08-15', 1),
(11, 'doctor1', 'Fasting Glucose', '165', 'mg/dL', '70-100', '2024-08-15', 1),
(12, 'doctor1', 'HbA1c', '6.8', '%', '4.0-5.6', '2024-08-10', 1),
(12, 'doctor1', 'Microalbumin', '45', 'mg/g', '<30', '2024-08-10', 1),

-- Cardiovascular labs
(14, 'doctor1', 'INR', '2.3', 'ratio', '0.8-1.1', '2024-08-25', 1),
(14, 'doctor1', 'PT', '24.5', 'seconds', '11-13', '2024-08-25', 1),
(15, 'doctor1', 'BNP', '580', 'pg/mL', '<100', '2024-08-18', 1),
(15, 'doctor1', 'Troponin I', '0.02', 'ng/mL', '<0.04', '2024-08-18', 0),

-- Respiratory labs
(17, 'doctor1', 'Total IgE', '450', 'IU/mL', '<100', '2024-08-22', 1),
(18, 'doctor1', 'Alpha-1 Antitrypsin', '85', 'mg/dL', '90-200', '2024-08-28', 1),

-- IBD labs
(20, 'doctor1', 'ESR', '45', 'mm/hr', '0-20', '2024-08-30', 1),
(20, 'doctor1', 'CRP', '12.5', 'mg/L', '<3.0', '2024-08-30', 1);
