-- High-frequency Indian patient cohorts with rich visit history
INSERT INTO patients (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  date_of_birth,
  gender,
  address,
  medical_record_number,
  blood_type,
  allergies,
  emergency_contact_name,
  emergency_contact_phone,
  current_doctor_name
) VALUES
  ('demo-user', 'Ananya', 'Rao', 'ananya.rao@email.com', '+91-98450-12345', '1989-04-10', 'Female', 'Flat 3B, 7th Main, Indiranagar, Bengaluru, KA', 'IN501', 'B+', 'None', 'Ravi Rao', '+91-98450-12346', 'Dr. Meera Reddy'),
  ('demo-user', 'Vikas', 'Menon', 'vikas.menon@email.com', '+91-98950-54321', '1985-11-18', 'Male', 'Villa 12, Marine Drive, Kochi, KL', 'IN502', 'O+', 'Seafood', 'Anjali Menon', '+91-98950-54322', 'Dr. Ashok Menon'),
  ('demo-user', 'Harini', 'Prasad', 'harini.prasad@email.com', '+91-98840-65432', '1990-02-27', 'Female', 'Plot 9, Besant Nagar, Chennai, TN', 'IN503', 'A+', 'Penicillin', 'Suresh Prasad', '+91-98840-65433', 'Dr. Kavitha Reddy'),
  ('demo-user', 'Kabir', 'Desai', 'kabir.desai@email.com', '+91-98700-67890', '1979-08-05', 'Male', '902, Bandra Kurla Complex, Mumbai, MH', 'IN504', 'AB+', 'None', 'Neelam Desai', '+91-98700-67891', 'Dr. Mohan Lal'),
  ('demo-user', 'Lakshmi', 'Pillai', 'lakshmi.pillai@email.com', '+91-98470-76543', '1983-06-14', 'Female', 'House 45, Kowdiar, Thiruvananthapuram, KL', 'IN505', 'B-', 'Sulfa drugs', 'Arun Pillai', '+91-98470-76544', 'Dr. Suresh Kumar');

-- Five encounters for each patient to support longitudinal dashboards
INSERT INTO medical_records (
  patient_id,
  user_id,
  visit_date,
  chief_complaint,
  diagnosis,
  prescription,
  notes,
  blood_pressure_systolic,
  blood_pressure_diastolic,
  heart_rate,
  temperature,
  weight,
  height,
  blood_sugar,
  cholesterol,
  doctor_name
) VALUES
  ((SELECT id FROM patients WHERE email = 'ananya.rao@email.com'), 'demo-user', '2024-01-05', 'Routine diabetes follow-up', 'Type 2 Diabetes Mellitus', 'Metformin 500mg, dietary log', 'Glycemic control improving with diet adherence.', 128, 82, 76, 98.6, 63.5, 162, 145, 195, 'Dr. Meera Reddy'),
  ((SELECT id FROM patients WHERE email = 'ananya.rao@email.com'), 'demo-user', '2024-03-12', 'Mild neuropathy symptoms', 'Diabetic Neuropathy (early)', 'Metformin 500mg + Pregabalin 75mg nocte', 'Foot care education provided, monofilament test borderline.', 130, 84, 78, 98.5, 63.0, 162, 155, 198, 'Dr. Meera Reddy'),
  ((SELECT id FROM patients WHERE email = 'ananya.rao@email.com'), 'demo-user', '2024-05-20', 'Seasonal allergy flare', 'Allergic Rhinitis with Diabetes', 'Cetirizine 10mg, continue diabetes meds', 'Allergic triggers identified; sugar log stable.', 126, 80, 74, 98.4, 62.8, 162, 142, 190, 'Dr. Meera Reddy'),
  ((SELECT id FROM patients WHERE email = 'ananya.rao@email.com'), 'demo-user', '2024-07-15', 'Follow-up for lifestyle review', 'Type 2 Diabetes Mellitus (controlled)', 'Metformin 500mg, add Vitamin D 1000 IU', 'Reduced fasting sugars, recommended morning walks.', 122, 78, 72, 98.7, 62.1, 162, 128, 182, 'Dr. Meera Reddy'),
  ((SELECT id FROM patients WHERE email = 'ananya.rao@email.com'), 'demo-user', '2024-09-30', 'Annual comprehensive check', 'Type 2 Diabetes Mellitus (stable)', 'Continue current plan', 'HbA1c trending down, weight maintained.', 118, 76, 70, 98.5, 61.9, 162, 118, 176, 'Dr. Meera Reddy'),

  ((SELECT id FROM patients WHERE email = 'vikas.menon@email.com'), 'demo-user', '2024-01-18', 'Hypertension evaluation', 'Stage 1 Hypertension', 'Amlodipine 5mg OD', 'Discussed DASH diet; baseline labs ordered.', 148, 94, 82, 98.6, 78.4, 175, 108, 205, 'Dr. Ashok Menon'),
  ((SELECT id FROM patients WHERE email = 'vikas.menon@email.com'), 'demo-user', '2024-03-22', 'Sleep disturbances & snoring', 'Obstructive Sleep Apnea suspicion', 'Sleep study referral, continue Amlodipine', 'Referred for polysomnography; BP mildly elevated.', 146, 92, 80, 98.5, 78.0, 175, 112, 210, 'Dr. Ashok Menon'),
  ((SELECT id FROM patients WHERE email = 'vikas.menon@email.com'), 'demo-user', '2024-05-28', 'Chest tightness on exertion', 'Hypertensive Heart Disease (early)', 'Add Losartan 50mg OD', 'ECHO scheduled; advised brisk walking.', 142, 90, 78, 98.7, 77.5, 175, 118, 215, 'Dr. Ashok Menon'),
  ((SELECT id FROM patients WHERE email = 'vikas.menon@email.com'), 'demo-user', '2024-08-10', 'Diet follow-up', 'Hypertension with dyslipidemia', 'Amlodipine 5mg + Losartan 50mg + Atorvastatin 20mg', 'Lipids remain elevated, added statin.', 136, 86, 76, 98.4, 77.0, 175, 110, 198, 'Dr. Ashok Menon'),
  ((SELECT id FROM patients WHERE email = 'vikas.menon@email.com'), 'demo-user', '2024-10-05', 'Wellness review', 'Controlled Hypertension', 'Continue current regimen', 'BP in target range; reinforce lifestyle changes.', 128, 82, 74, 98.3, 76.5, 175, 100, 188, 'Dr. Ashok Menon'),

  ((SELECT id FROM patients WHERE email = 'harini.prasad@email.com'), 'demo-user', '2024-02-02', 'Thyroid fatigue follow-up', 'Hashimoto Hypothyroidism', 'Levothyroxine 75mcg OD', 'Energy levels improving; repeat labs planned.', 118, 76, 72, 98.2, 58.4, 158, 92, 165, 'Dr. Kavitha Reddy'),
  ((SELECT id FROM patients WHERE email = 'harini.prasad@email.com'), 'demo-user', '2024-04-12', 'Hair fall and weight gain', 'Hypothyroidism with PCOS overlap', 'Levothyroxine 75mcg + Metformin 500mg', 'Discussed PCOS lifestyle measures.', 120, 78, 74, 98.4, 58.0, 158, 96, 170, 'Dr. Kavitha Reddy'),
  ((SELECT id FROM patients WHERE email = 'harini.prasad@email.com'), 'demo-user', '2024-06-25', 'Menstrual irregularities', 'PCOS with Hypothyroidism', 'Continue meds, add Myo-inositol', 'Ultrasound shows polycystic ovaries, lifestyle counseling.', 118, 76, 70, 98.5, 57.6, 158, 102, 175, 'Dr. Kavitha Reddy'),
  ((SELECT id FROM patients WHERE email = 'harini.prasad@email.com'), 'demo-user', '2024-08-30', 'Follow-up for fatigue', 'Hypothyroidism (controlled)', 'Levothyroxine 75mcg', 'TSH within range, encouraged yoga.', 116, 74, 68, 98.3, 57.0, 158, 90, 168, 'Dr. Kavitha Reddy'),
  ((SELECT id FROM patients WHERE email = 'harini.prasad@email.com'), 'demo-user', '2024-10-20', 'Annual thyroid review', 'Hypothyroidism stable', 'Continue current plan', 'Symptoms minimal, maintain routine.', 114, 72, 66, 98.2, 56.8, 158, 88, 162, 'Dr. Kavitha Reddy'),

  ((SELECT id FROM patients WHERE email = 'kabir.desai@email.com'), 'demo-user', '2024-01-10', 'Post-MI rehabilitation review', 'Coronary Artery Disease', 'Aspirin 75mg, Clopidogrel 75mg, Atorvastatin 40mg', 'Post angioplasty follow-up with stable vitals.', 132, 82, 72, 98.6, 74.0, 172, 102, 180, 'Dr. Mohan Lal'),
  ((SELECT id FROM patients WHERE email = 'kabir.desai@email.com'), 'demo-user', '2024-03-18', 'Cardiac rehab session', 'Coronary Artery Disease (stable)', 'Continue dual antiplatelet therapy', 'Exercise tolerance improving; enrolled in rehab.', 128, 80, 70, 98.5, 73.0, 172, 95, 175, 'Dr. Mohan Lal'),
  ((SELECT id FROM patients WHERE email = 'kabir.desai@email.com'), 'demo-user', '2024-06-02', 'Lipid review', 'Dyslipidemia with CAD', 'Atorvastatin 40mg, add Ezetimibe 10mg', 'LDL still elevated; medication adjusted.', 126, 78, 68, 98.4, 72.5, 172, 90, 220, 'Dr. Mohan Lal'),
  ((SELECT id FROM patients WHERE email = 'kabir.desai@email.com'), 'demo-user', '2024-08-08', 'Stress test follow-up', 'Coronary Artery Disease (stable)', 'Continue medications', 'Treadmill test negative for ischemia.', 124, 76, 68, 98.5, 72.0, 172, 88, 200, 'Dr. Mohan Lal'),
  ((SELECT id FROM patients WHERE email = 'kabir.desai@email.com'), 'demo-user', '2024-10-18', 'Comprehensive cardiac review', 'CAD with Hypertension', 'Add Ramipril 2.5mg OD', 'BP creeping up; ACE inhibitor started.', 130, 84, 70, 98.6, 72.3, 172, 92, 198, 'Dr. Mohan Lal'),

  ((SELECT id FROM patients WHERE email = 'lakshmi.pillai@email.com'), 'demo-user', '2024-01-22', 'Chronic kidney disease consult', 'CKD Stage 2 with Hypertension', 'Telmisartan 40mg, renal diet counseling', 'Renal function monitored quarterly.', 135, 88, 78, 98.4, 68.2, 160, 108, 210, 'Dr. Suresh Kumar'),
  ((SELECT id FROM patients WHERE email = 'lakshmi.pillai@email.com'), 'demo-user', '2024-03-30', 'Edema and fatigue', 'CKD Stage 3 progression', 'Telmisartan 40mg + Furosemide 20mg', 'Mild pedal edema; advised salt restriction.', 138, 90, 80, 98.6, 68.0, 160, 115, 215, 'Dr. Suresh Kumar'),
  ((SELECT id FROM patients WHERE email = 'lakshmi.pillai@email.com'), 'demo-user', '2024-06-12', 'Anemia evaluation', 'CKD with Anemia of chronic disease', 'Injectable Erythropoietin, Iron supplementation', 'Hemoglobin trending low; ESA initiated.', 136, 88, 78, 98.7, 67.6, 160, 112, 208, 'Dr. Suresh Kumar'),
  ((SELECT id FROM patients WHERE email = 'lakshmi.pillai@email.com'), 'demo-user', '2024-08-25', 'Renal diet follow-up', 'CKD Stage 3 stable', 'Continue regimen, add Calcium acetate', 'Phosphate control emphasized; labs reviewed.', 132, 86, 76, 98.5, 67.0, 160, 105, 200, 'Dr. Suresh Kumar'),
  ((SELECT id FROM patients WHERE email = 'lakshmi.pillai@email.com'), 'demo-user', '2024-10-28', 'Annual nephrology review', 'CKD Stage 3 (stable)', 'Maintain current plan', 'GFR stable, anemia improved.', 130, 84, 74, 98.4, 66.8, 160, 102, 198, 'Dr. Suresh Kumar');

-- Lab panel coverage aligning with each encounter
INSERT INTO lab_results (
  patient_id,
  user_id,
  test_name,
  test_value,
  test_unit,
  reference_range,
  test_date,
  is_abnormal,
  doctor_name
) VALUES
  ((SELECT id FROM patients WHERE email = 'ananya.rao@email.com'), 'demo-user', 'HbA1c', '7.6', '%', '<7.0', '2024-01-05', 1, 'Dr. Meera Reddy'),
  ((SELECT id FROM patients WHERE email = 'ananya.rao@email.com'), 'demo-user', 'Fasting Glucose', '145', 'mg/dL', '70-100', '2024-03-12', 1, 'Dr. Meera Reddy'),
  ((SELECT id FROM patients WHERE email = 'ananya.rao@email.com'), 'demo-user', 'Vitamin D', '22', 'ng/mL', '30-100', '2024-05-20', 1, 'Dr. Meera Reddy'),
  ((SELECT id FROM patients WHERE email = 'ananya.rao@email.com'), 'demo-user', 'Lipid Profile - LDL', '118', 'mg/dL', '<100', '2024-07-15', 1, 'Dr. Meera Reddy'),
  ((SELECT id FROM patients WHERE email = 'ananya.rao@email.com'), 'demo-user', 'Creatinine', '0.9', 'mg/dL', '0.6-1.1', '2024-09-30', 0, 'Dr. Meera Reddy'),

  ((SELECT id FROM patients WHERE email = 'vikas.menon@email.com'), 'demo-user', 'Lipid Profile - LDL', '138', 'mg/dL', '<100', '2024-01-18', 1, 'Dr. Ashok Menon'),
  ((SELECT id FROM patients WHERE email = 'vikas.menon@email.com'), 'demo-user', 'TSH', '3.2', 'mIU/L', '0.4-4.0', '2024-03-22', 0, 'Dr. Ashok Menon'),
  ((SELECT id FROM patients WHERE email = 'vikas.menon@email.com'), 'demo-user', 'Echocardiogram Ejection Fraction', '52', '%', '55-70', '2024-05-28', 1, 'Dr. Ashok Menon'),
  ((SELECT id FROM patients WHERE email = 'vikas.menon@email.com'), 'demo-user', 'Lipid Profile - HDL', '38', 'mg/dL', '>40', '2024-08-10', 1, 'Dr. Ashok Menon'),
  ((SELECT id FROM patients WHERE email = 'vikas.menon@email.com'), 'demo-user', 'Serum Potassium', '4.8', 'mmol/L', '3.6-5.2', '2024-10-05', 0, 'Dr. Ashok Menon'),

  ((SELECT id FROM patients WHERE email = 'harini.prasad@email.com'), 'demo-user', 'TSH', '8.4', 'mIU/L', '0.4-4.0', '2024-02-02', 1, 'Dr. Kavitha Reddy'),
  ((SELECT id FROM patients WHERE email = 'harini.prasad@email.com'), 'demo-user', 'Free T4', '0.7', 'ng/dL', '0.8-1.8', '2024-04-12', 1, 'Dr. Kavitha Reddy'),
  ((SELECT id FROM patients WHERE email = 'harini.prasad@email.com'), 'demo-user', 'LH/FSH Ratio', '2.5', 'ratio', '<2.0', '2024-06-25', 1, 'Dr. Kavitha Reddy'),
  ((SELECT id FROM patients WHERE email = 'harini.prasad@email.com'), 'demo-user', 'TSH', '3.5', 'mIU/L', '0.4-4.0', '2024-08-30', 0, 'Dr. Kavitha Reddy'),
  ((SELECT id FROM patients WHERE email = 'harini.prasad@email.com'), 'demo-user', 'HbA1c', '5.6', '%', '<7.0', '2024-10-20', 0, 'Dr. Kavitha Reddy'),

  ((SELECT id FROM patients WHERE email = 'kabir.desai@email.com'), 'demo-user', 'Troponin I', '0.03', 'ng/mL', '<0.04', '2024-01-10', 0, 'Dr. Mohan Lal'),
  ((SELECT id FROM patients WHERE email = 'kabir.desai@email.com'), 'demo-user', 'Lipid Profile - LDL', '132', 'mg/dL', '<100', '2024-03-18', 1, 'Dr. Mohan Lal'),
  ((SELECT id FROM patients WHERE email = 'kabir.desai@email.com'), 'demo-user', 'Lipid Profile - Triglycerides', '210', 'mg/dL', '<150', '2024-06-02', 1, 'Dr. Mohan Lal'),
  ((SELECT id FROM patients WHERE email = 'kabir.desai@email.com'), 'demo-user', 'Stress Test METS', '8.5', 'METS', '>10', '2024-08-08', 1, 'Dr. Mohan Lal'),
  ((SELECT id FROM patients WHERE email = 'kabir.desai@email.com'), 'demo-user', 'Serum Creatinine', '1.1', 'mg/dL', '0.6-1.3', '2024-10-18', 0, 'Dr. Mohan Lal'),

  ((SELECT id FROM patients WHERE email = 'lakshmi.pillai@email.com'), 'demo-user', 'Serum Creatinine', '1.4', 'mg/dL', '0.6-1.1', '2024-01-22', 1, 'Dr. Suresh Kumar'),
  ((SELECT id FROM patients WHERE email = 'lakshmi.pillai@email.com'), 'demo-user', 'eGFR', '62', 'mL/min/1.73m²', '>90', '2024-03-30', 1, 'Dr. Suresh Kumar'),
  ((SELECT id FROM patients WHERE email = 'lakshmi.pillai@email.com'), 'demo-user', 'Hemoglobin', '10.8', 'g/dL', '12-15', '2024-06-12', 1, 'Dr. Suresh Kumar'),
  ((SELECT id FROM patients WHERE email = 'lakshmi.pillai@email.com'), 'demo-user', 'Serum Phosphorus', '5.6', 'mg/dL', '2.5-4.5', '2024-08-25', 1, 'Dr. Suresh Kumar'),
  ((SELECT id FROM patients WHERE email = 'lakshmi.pillai@email.com'), 'demo-user', 'Serum Calcium', '8.4', 'mg/dL', '8.6-10.2', '2024-10-28', 1, 'Dr. Suresh Kumar');
