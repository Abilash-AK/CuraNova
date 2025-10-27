
-- Insert 30 Indian patients with realistic data
INSERT INTO patients (user_id, first_name, last_name, email, phone, date_of_birth, gender, address, medical_record_number, blood_type, allergies, emergency_contact_name, emergency_contact_phone, current_doctor_name) VALUES
('demo-user', 'Rajesh', 'Sharma', 'rajesh.sharma@email.com', '+91-9876543210', '1975-03-15', 'Male', 'A-101, Sector 15, Noida, UP', 'MRN001', 'B+', 'Penicillin', 'Sunita Sharma', '+91-9876543211', 'Dr. Anil Kumar'),
('demo-user', 'Priya', 'Singh', 'priya.singh@email.com', '+91-9876543212', '1982-07-22', 'Female', '23/4, MG Road, Bangalore, KA', 'MRN002', 'A+', 'Shellfish', 'Vikram Singh', '+91-9876543213', 'Dr. Meera Reddy'),
('demo-user', 'Amit', 'Patel', 'amit.patel@email.com', '+91-9876543214', '1978-11-08', 'Male', '45, Ashram Road, Ahmedabad, GJ', 'MRN003', 'O+', 'None', 'Neha Patel', '+91-9876543215', 'Dr. Ravi Joshi'),
('demo-user', 'Deepika', 'Verma', 'deepika.verma@email.com', '+91-9876543216', '1985-01-12', 'Female', '78, Park Street, Kolkata, WB', 'MRN004', 'AB+', 'Dust, Pollen', 'Rohit Verma', '+91-9876543217', 'Dr. Sudha Banerjee'),
('demo-user', 'Sanjay', 'Kumar', 'sanjay.kumar@email.com', '+91-9876543218', '1973-09-25', 'Male', '12, CP Road, Delhi', 'MRN005', 'B-', 'Aspirin', 'Asha Kumar', '+91-9876543219', 'Dr. Vinod Gupta'),
('demo-user', 'Kavita', 'Agarwal', 'kavita.agarwal@email.com', '+91-9876543220', '1980-05-18', 'Female', '56, Civil Lines, Jaipur, RJ', 'MRN006', 'A-', 'None', 'Suresh Agarwal', '+91-9876543221', 'Dr. Pradeep Sharma'),
('demo-user', 'Ravi', 'Nair', 'ravi.nair@email.com', '+91-9876543222', '1976-12-03', 'Male', '89, Marine Drive, Mumbai, MH', 'MRN007', 'O-', 'Sulfa drugs', 'Lakshmi Nair', '+91-9876543223', 'Dr. Ashok Menon'),
('demo-user', 'Anita', 'Joshi', 'anita.joshi@email.com', '+91-9876543224', '1983-04-14', 'Female', '34, Model Town, Chandigarh', 'MRN008', 'B+', 'Latex', 'Manoj Joshi', '+91-9876543225', 'Dr. Sonia Kapoor'),
('demo-user', 'Vikram', 'Reddy', 'vikram.reddy@email.com', '+91-9876543226', '1979-08-27', 'Male', '67, Banjara Hills, Hyderabad, TS', 'MRN009', 'A+', 'None', 'Sriya Reddy', '+91-9876543227', 'Dr. Kiran Rao'),
('demo-user', 'Meera', 'Gupta', 'meera.gupta@email.com', '+91-9876543228', '1984-02-09', 'Female', '23, Salt Lake, Kolkata, WB', 'MRN010', 'AB-', 'Iodine', 'Rajesh Gupta', '+91-9876543229', 'Dr. Dipak Sen'),
('demo-user', 'Suresh', 'Iyer', 'suresh.iyer@email.com', '+91-9876543230', '1977-06-16', 'Male', '45, T Nagar, Chennai, TN', 'MRN011', 'O+', 'None', 'Lakshmi Iyer', '+91-9876543231', 'Dr. Raghavan'),
('demo-user', 'Pooja', 'Mehta', 'pooja.mehta@email.com', '+91-9876543232', '1981-10-21', 'Female', '78, Satellite, Ahmedabad, GJ', 'MRN012', 'B+', 'Penicillin', 'Arjun Mehta', '+91-9876543233', 'Dr. Nirmala Shah'),
('demo-user', 'Ashish', 'Mishra', 'ashish.mishra@email.com', '+91-9876543234', '1974-03-30', 'Male', '12, Gomti Nagar, Lucknow, UP', 'MRN013', 'A-', 'Sulfa drugs', 'Sunita Mishra', '+91-9876543235', 'Dr. Rakesh Tiwari'),
('demo-user', 'Neha', 'Chopra', 'neha.chopra@email.com', '+91-9876543236', '1986-07-05', 'Female', '56, Green Park, Delhi', 'MRN014', 'AB+', 'None', 'Rohit Chopra', '+91-9876543237', 'Dr. Anjali Sinha'),
('demo-user', 'Manoj', 'Tiwari', 'manoj.tiwari@email.com', '+91-9876543238', '1972-11-18', 'Male', '89, Hazratganj, Lucknow, UP', 'MRN015', 'O-', 'Aspirin', 'Geeta Tiwari', '+91-9876543239', 'Dr. Sunil Pandey'),
('demo-user', 'Shweta', 'Bansal', 'shweta.bansal@email.com', '+91-9876543240', '1983-05-23', 'Female', '34, Lajpat Nagar, Delhi', 'MRN016', 'B-', 'Shellfish', 'Vivek Bansal', '+91-9876543241', 'Dr. Ritu Agarwal'),
('demo-user', 'Rahul', 'Saxena', 'rahul.saxena@email.com', '+91-9876543242', '1978-09-11', 'Male', '67, Indore, MP', 'MRN017', 'A+', 'None', 'Priya Saxena', '+91-9876543243', 'Dr. Shyam Agarwal'),
('demo-user', 'Sonal', 'Dave', 'sonal.dave@email.com', '+91-9876543244', '1985-01-28', 'Female', '23, Navrangpura, Ahmedabad, GJ', 'MRN018', 'O+', 'Dust, Pollen', 'Kiran Dave', '+91-9876543245', 'Dr. Hetal Desai'),
('demo-user', 'Arjun', 'Kapoor', 'arjun.kapoor@email.com', '+91-9876543246', '1976-04-07', 'Male', '45, Punjabi Bagh, Delhi', 'MRN019', 'B+', 'Latex', 'Seema Kapoor', '+91-9876543247', 'Dr. Mohan Lal'),
('demo-user', 'Ritu', 'Agarwal', 'ritu.agarwal@email.com', '+91-9876543248', '1982-08-14', 'Female', '78, Koramangala, Bangalore, KA', 'MRN020', 'AB-', 'None', 'Amit Agarwal', '+91-9876543249', 'Dr. Kavitha Reddy'),
('demo-user', 'Sandeep', 'Jain', 'sandeep.jain@email.com', '+91-9876543250', '1975-12-02', 'Male', '12, C Scheme, Jaipur, RJ', 'MRN021', 'A-', 'Iodine', 'Manju Jain', '+91-9876543251', 'Dr. Rajendra Singh'),
('demo-user', 'Divya', 'Malhotra', 'divya.malhotra@email.com', '+91-9876543252', '1984-06-19', 'Female', '56, Sector 17, Chandigarh', 'MRN022', 'O-', 'Penicillin', 'Anil Malhotra', '+91-9876543253', 'Dr. Sunita Sharma'),
('demo-user', 'Kiran', 'Pillai', 'kiran.pillai@email.com', '+91-9876543254', '1979-02-26', 'Male', '89, Kakkanad, Kochi, KL', 'MRN023', 'B+', 'None', 'Radha Pillai', '+91-9876543255', 'Dr. Suresh Kumar'),
('demo-user', 'Smita', 'Kulkarni', 'smita.kulkarni@email.com', '+91-9876543256', '1981-10-13', 'Female', '34, Pune, MH', 'MRN024', 'A+', 'Sulfa drugs', 'Sachin Kulkarni', '+91-9876543257', 'Dr. Pratima Joshi'),
('demo-user', 'Ajay', 'Yadav', 'ajay.yadav@email.com', '+91-9876543258', '1977-07-04', 'Male', '67, Patna, BR', 'MRN025', 'AB+', 'Aspirin', 'Meena Yadav', '+91-9876543259', 'Dr. Ramesh Kumar'),
('demo-user', 'Rekha', 'Sood', 'rekha.sood@email.com', '+91-9876543260', '1983-03-17', 'Female', '23, Shimla, HP', 'MRN026', 'O+', 'None', 'Raj Sood', '+91-9876543261', 'Dr. Neelam Verma'),
('demo-user', 'Nitin', 'Bhardwaj', 'nitin.bhardwaj@email.com', '+91-9876543262', '1974-11-24', 'Male', '45, Dehradun, UK', 'MRN027', 'B-', 'Shellfish', 'Sushma Bhardwaj', '+91-9876543263', 'Dr. Vinay Kumar'),
('demo-user', 'Preeti', 'Arora', 'preeti.arora@email.com', '+91-9876543264', '1986-05-31', 'Female', '78, Amritsar, PB', 'MRN028', 'A-', 'Dust, Pollen', 'Sunil Arora', '+91-9876543265', 'Dr. Jasbir Singh'),
('demo-user', 'Deepak', 'Thakur', 'deepak.thakur@email.com', '+91-9876543266', '1976-09-08', 'Male', '12, Guwahati, AS', 'MRN029', 'AB-', 'Latex', 'Kavita Thakur', '+91-9876543267', 'Dr. Binod Das'),
('demo-user', 'Sunita', 'Bose', 'sunita.bose@email.com', '+91-9876543268', '1980-01-15', 'Female', '56, Bhubaneswar, OR', 'MRN030', 'O-', 'Iodine', 'Tapan Bose', '+91-9876543269', 'Dr. Priya Mohanty');

-- Insert medical records with common Indian health conditions
INSERT INTO medical_records (patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription, notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, height, blood_sugar, cholesterol, doctor_name) VALUES
-- Diabetes related records
(1, 'demo-user', '2024-01-15', 'Increased thirst and frequent urination', 'Type 2 Diabetes Mellitus', 'Metformin 500mg twice daily', 'Patient shows signs of hyperglycemia. Advised dietary modifications and regular exercise.', 140, 90, 78, 98.6, 78.5, 170, 180, 220, 'Dr. Anil Kumar'),
(1, 'demo-user', '2024-06-15', 'Follow-up for diabetes management', 'Type 2 Diabetes Mellitus - controlled', 'Metformin 500mg twice daily, Glimepiride 2mg', 'Blood sugar levels improving. Continue current medication.', 135, 85, 76, 98.4, 77.2, 170, 140, 200, 'Dr. Anil Kumar'),
(5, 'demo-user', '2024-02-20', 'Excessive urination and fatigue', 'Type 2 Diabetes Mellitus', 'Metformin 500mg twice daily', 'New diagnosis of diabetes. Patient counseled on lifestyle changes.', 145, 92, 82, 99.1, 85.3, 175, 195, 240, 'Dr. Vinod Gupta'),
(13, 'demo-user', '2024-03-10', 'Blurred vision and increased appetite', 'Type 2 Diabetes Mellitus', 'Metformin 500mg + Gliclazide 80mg', 'Diabetic retinopathy screening recommended.', 138, 88, 80, 98.8, 80.1, 168, 220, 250, 'Dr. Rakesh Tiwari'),
(21, 'demo-user', '2024-04-12', 'Numbness in feet', 'Diabetic Neuropathy', 'Metformin + Pregabalin 75mg', 'Diabetic complications developing. Strict glucose control needed.', 142, 90, 85, 98.7, 82.5, 172, 165, 230, 'Dr. Rajendra Singh'),
(25, 'demo-user', '2024-05-18', 'Frequent infections and slow healing', 'Type 2 Diabetes Mellitus', 'Insulin + Metformin', 'Poor glycemic control. Switching to insulin therapy.', 150, 95, 88, 99.2, 88.7, 165, 280, 260, 'Dr. Ramesh Kumar'),

-- Hypertension related records
(2, 'demo-user', '2024-01-20', 'Headache and dizziness', 'Essential Hypertension', 'Amlodipine 5mg once daily', 'High blood pressure detected. Lifestyle modifications advised.', 160, 100, 85, 98.5, 65.2, 162, 110, 180, 'Dr. Meera Reddy'),
(2, 'demo-user', '2024-07-20', 'Follow-up for hypertension', 'Essential Hypertension - controlled', 'Amlodipine 5mg + Losartan 50mg', 'Blood pressure well controlled with current medication.', 130, 80, 72, 98.3, 64.8, 162, 95, 170, 'Dr. Meera Reddy'),
(7, 'demo-user', '2024-02-25', 'Chest discomfort and palpitations', 'Essential Hypertension', 'Atenolol 50mg once daily', 'Hypertension with cardiac symptoms. ECG normal.', 170, 105, 92, 98.9, 75.6, 175, 105, 195, 'Dr. Ashok Menon'),
(11, 'demo-user', '2024-03-15', 'Morning headaches', 'Essential Hypertension', 'Telmisartan 40mg', 'Early morning hypertension. Medication timing adjusted.', 155, 98, 78, 98.4, 68.3, 165, 100, 185, 'Dr. Raghavan'),
(15, 'demo-user', '2024-04-22', 'Blurred vision and fatigue', 'Hypertensive Retinopathy', 'Amlodipine + Hydrochlorothiazide', 'Hypertensive complications in eyes. Urgent control needed.', 180, 110, 95, 99.1, 72.4, 168, 115, 220, 'Dr. Sunil Pandey'),
(19, 'demo-user', '2024-05-28', 'Shortness of breath on exertion', 'Hypertensive Heart Disease', 'ACE inhibitors + Beta blockers', 'Cardiac involvement due to uncontrolled hypertension.', 165, 102, 88, 98.6, 78.9, 172, 108, 210, 'Dr. Mohan Lal'),

-- Respiratory conditions
(3, 'demo-user', '2024-01-25', 'Persistent cough and breathlessness', 'Bronchial Asthma', 'Salbutamol inhaler + Budesonide', 'Allergic asthma triggered by dust exposure. Avoid allergens.', 120, 80, 95, 98.7, 72.1, 168, 95, 160, 'Dr. Ravi Joshi'),
(8, 'demo-user', '2024-02-28', 'Wheezing and chest tightness', 'Bronchial Asthma', 'Salbutamol + Montelukast', 'Exercise-induced asthma. Pre-medication before exercise advised.', 115, 75, 98, 99.0, 58.7, 160, 90, 150, 'Dr. Sonia Kapoor'),
(14, 'demo-user', '2024-03-20', 'Seasonal cough and sneezing', 'Allergic Rhinitis with Asthma', 'Antihistamines + Nasal spray', 'Seasonal allergies triggering respiratory symptoms.', 125, 82, 88, 98.5, 61.3, 158, 85, 155, 'Dr. Anjali Sinha'),
(18, 'demo-user', '2024-04-25', 'Chronic cough with sputum', 'Chronic Obstructive Pulmonary Disease', 'Bronchodilators + Steroids', 'COPD due to air pollution exposure. Smoking cessation counseling.', 130, 85, 92, 98.8, 64.9, 162, 100, 175, 'Dr. Hetal Desai'),
(22, 'demo-user', '2024-05-30', 'Difficulty breathing at night', 'Sleep Apnea with Asthma', 'CPAP therapy + Inhalers', 'Sleep study confirms obstructive sleep apnea.', 135, 88, 85, 98.4, 71.2, 165, 95, 180, 'Dr. Sunita Sharma'),

-- Cardiovascular conditions
(4, 'demo-user', '2024-02-02', 'Chest pain and palpitations', 'Ischemic Heart Disease', 'Aspirin + Atorvastatin + Metoprolol', 'Mild coronary artery disease detected on angiography.', 145, 95, 105, 98.9, 68.4, 160, 110, 280, 'Dr. Sudha Banerjee'),
(9, 'demo-user', '2024-03-08', 'Leg swelling and fatigue', 'Heart Failure', 'ACE inhibitors + Diuretics', 'Early heart failure. Regular monitoring required.', 140, 90, 110, 98.6, 75.8, 170, 105, 250, 'Dr. Kiran Rao'),
(17, 'demo-user', '2024-04-14', 'Chest discomfort on walking', 'Angina Pectoris', 'Nitroglycerin + Beta blockers', 'Stable angina. Stress test shows ischemia.', 150, 92, 95, 98.7, 73.6, 175, 115, 290, 'Dr. Shyam Agarwal'),
(23, 'demo-user', '2024-05-20', 'Irregular heartbeat', 'Atrial Fibrillation', 'Warfarin + Rate control medications', 'New onset atrial fibrillation. Anticoagulation started.', 135, 85, 120, 98.5, 70.2, 168, 100, 200, 'Dr. Suresh Kumar'),

-- Gastrointestinal conditions
(6, 'demo-user', '2024-02-05', 'Abdominal pain and acidity', 'Peptic Ulcer Disease', 'Proton pump inhibitors + Antibiotics', 'H. pylori positive. Triple therapy initiated.', 125, 78, 72, 98.4, 62.5, 158, 90, 165, 'Dr. Pradeep Sharma'),
(10, 'demo-user', '2024-03-12', 'Heartburn and regurgitation', 'Gastroesophageal Reflux Disease', 'Omeprazole + Antacids', 'GERD with esophagitis. Dietary modifications advised.', 120, 75, 70, 98.3, 59.8, 155, 85, 160, 'Dr. Dipak Sen'),
(16, 'demo-user', '2024-04-18', 'Bloating and irregular bowel movements', 'Irritable Bowel Syndrome', 'Antispasmodics + Probiotics', 'Stress-related IBS. Stress management counseling provided.', 115, 72, 68, 98.2, 56.4, 152, 80, 150, 'Dr. Ritu Agarwal'),
(20, 'demo-user', '2024-05-24', 'Severe abdominal pain', 'Acute Gastritis', 'IV fluids + Antacids + Antibiotics', 'Acute episode triggered by spicy food consumption.', 130, 80, 85, 99.2, 61.7, 160, 95, 170, 'Dr. Kavitha Reddy'),

-- Thyroid conditions
(12, 'demo-user', '2024-02-10', 'Weight gain and fatigue', 'Hypothyroidism', 'Levothyroxine 50mcg', 'Primary hypothyroidism. Regular monitoring of TSH levels.', 125, 80, 65, 97.8, 68.9, 162, 95, 190, 'Dr. Nirmala Shah'),
(24, 'demo-user', '2024-03-16', 'Weight loss and palpitations', 'Hyperthyroidism', 'Carbimazole + Beta blockers', 'Graves disease. Endocrinology referral made.', 140, 85, 115, 99.5, 55.3, 158, 100, 160, 'Dr. Pratima Joshi'),
(26, 'demo-user', '2024-04-20', 'Neck swelling and voice changes', 'Goiter', 'Thyroid hormone replacement', 'Multi-nodular goiter. Ultrasound shows benign nodules.', 120, 75, 70, 98.4, 65.7, 160, 90, 175, 'Dr. Neelam Verma'),

-- Joint and musculoskeletal conditions
(27, 'demo-user', '2024-02-15', 'Joint pain and morning stiffness', 'Rheumatoid Arthritis', 'Methotrexate + Steroids', 'Early RA detected. Disease modifying therapy started.', 130, 82, 75, 98.6, 72.8, 170, 100, 180, 'Dr. Vinay Kumar'),
(28, 'demo-user', '2024-03-22', 'Knee pain and swelling', 'Osteoarthritis', 'NSAIDs + Physiotherapy', 'Degenerative joint disease. Weight reduction advised.', 135, 85, 78, 98.5, 78.5, 155, 105, 195, 'Dr. Jasbir Singh'),
(29, 'demo-user', '2024-04-28', 'Lower back pain', 'Lumbar Spondylosis', 'Muscle relaxants + Physiotherapy', 'Age-related spinal changes. Avoid heavy lifting.', 125, 80, 72, 98.3, 75.2, 175, 95, 170, 'Dr. Binod Das'),
(30, 'demo-user', '2024-05-25', 'Widespread body pain', 'Fibromyalgia', 'Pregabalin + Antidepressants', 'Chronic pain syndrome. Stress management important.', 120, 75, 70, 98.4, 62.1, 162, 90, 165, 'Dr. Priya Mohanty');

-- Insert lab results with realistic Indian population values
INSERT INTO lab_results (patient_id, user_id, test_name, test_value, test_unit, reference_range, test_date, is_abnormal, doctor_name) VALUES
-- Diabetes-related lab results
(1, 'demo-user', 'Fasting Blood Glucose', '180', 'mg/dL', '70-100', '2024-01-15', 1, 'Dr. Anil Kumar'),
(1, 'demo-user', 'HbA1c', '8.5', '%', '<7.0', '2024-01-15', 1, 'Dr. Anil Kumar'),
(1, 'demo-user', 'Fasting Blood Glucose', '140', 'mg/dL', '70-100', '2024-06-15', 1, 'Dr. Anil Kumar'),
(1, 'demo-user', 'HbA1c', '7.2', '%', '<7.0', '2024-06-15', 1, 'Dr. Anil Kumar'),
(5, 'demo-user', 'Fasting Blood Glucose', '195', 'mg/dL', '70-100', '2024-02-20', 1, 'Dr. Vinod Gupta'),
(5, 'demo-user', 'HbA1c', '9.1', '%', '<7.0', '2024-02-20', 1, 'Dr. Vinod Gupta'),
(13, 'demo-user', 'Fasting Blood Glucose', '220', 'mg/dL', '70-100', '2024-03-10', 1, 'Dr. Rakesh Tiwari'),
(13, 'demo-user', 'HbA1c', '9.8', '%', '<7.0', '2024-03-10', 1, 'Dr. Rakesh Tiwari'),
(21, 'demo-user', 'Fasting Blood Glucose', '165', 'mg/dL', '70-100', '2024-04-12', 1, 'Dr. Rajendra Singh'),
(21, 'demo-user', 'HbA1c', '7.8', '%', '<7.0', '2024-04-12', 1, 'Dr. Rajendra Singh'),
(25, 'demo-user', 'Fasting Blood Glucose', '280', 'mg/dL', '70-100', '2024-05-18', 1, 'Dr. Ramesh Kumar'),
(25, 'demo-user', 'HbA1c', '11.2', '%', '<7.0', '2024-05-18', 1, 'Dr. Ramesh Kumar'),

-- Lipid profile results
(2, 'demo-user', 'Total Cholesterol', '220', 'mg/dL', '<200', '2024-01-20', 1, 'Dr. Meera Reddy'),
(2, 'demo-user', 'LDL Cholesterol', '145', 'mg/dL', '<100', '2024-01-20', 1, 'Dr. Meera Reddy'),
(2, 'demo-user', 'HDL Cholesterol', '38', 'mg/dL', '>40', '2024-01-20', 1, 'Dr. Meera Reddy'),
(2, 'demo-user', 'Triglycerides', '180', 'mg/dL', '<150', '2024-01-20', 1, 'Dr. Meera Reddy'),
(7, 'demo-user', 'Total Cholesterol', '240', 'mg/dL', '<200', '2024-02-25', 1, 'Dr. Ashok Menon'),
(7, 'demo-user', 'LDL Cholesterol', '165', 'mg/dL', '<100', '2024-02-25', 1, 'Dr. Ashok Menon'),
(11, 'demo-user', 'Total Cholesterol', '210', 'mg/dL', '<200', '2024-03-15', 1, 'Dr. Raghavan'),
(11, 'demo-user', 'HDL Cholesterol', '35', 'mg/dL', '>40', '2024-03-15', 1, 'Dr. Raghavan'),
(15, 'demo-user', 'Total Cholesterol', '260', 'mg/dL', '<200', '2024-04-22', 1, 'Dr. Sunil Pandey'),
(15, 'demo-user', 'LDL Cholesterol', '185', 'mg/dL', '<100', '2024-04-22', 1, 'Dr. Sunil Pandey'),
(19, 'demo-user', 'Total Cholesterol', '230', 'mg/dL', '<200', '2024-05-28', 1, 'Dr. Mohan Lal'),
(19, 'demo-user', 'Triglycerides', '220', 'mg/dL', '<150', '2024-05-28', 1, 'Dr. Mohan Lal'),

-- Complete Blood Count
(3, 'demo-user', 'Hemoglobin', '11.2', 'g/dL', '12-15', '2024-01-25', 1, 'Dr. Ravi Joshi'),
(3, 'demo-user', 'White Blood Cell Count', '12000', 'cells/μL', '4000-11000', '2024-01-25', 1, 'Dr. Ravi Joshi'),
(3, 'demo-user', 'Eosinophil Count', '8', '%', '1-4', '2024-01-25', 1, 'Dr. Ravi Joshi'),
(8, 'demo-user', 'Hemoglobin', '10.8', 'g/dL', '12-15', '2024-02-28', 1, 'Dr. Sonia Kapoor'),
(8, 'demo-user', 'Total IgE', '450', 'IU/mL', '<100', '2024-02-28', 1, 'Dr. Sonia Kapoor'),
(14, 'demo-user', 'Eosinophil Count', '12', '%', '1-4', '2024-03-20', 1, 'Dr. Anjali Sinha'),
(14, 'demo-user', 'Total IgE', '380', 'IU/mL', '<100', '2024-03-20', 1, 'Dr. Anjali Sinha'),
(18, 'demo-user', 'Hemoglobin', '9.5', 'g/dL', '12-15', '2024-04-25', 1, 'Dr. Hetal Desai'),
(18, 'demo-user', 'White Blood Cell Count', '13500', 'cells/μL', '4000-11000', '2024-04-25', 1, 'Dr. Hetal Desai'),
(22, 'demo-user', 'Hemoglobin', '11.5', 'g/dL', '12-15', '2024-05-30', 1, 'Dr. Sunita Sharma'),
(22, 'demo-user', 'Oxygen Saturation', '92', '%', '>95', '2024-05-30', 1, 'Dr. Sunita Sharma'),

-- Cardiac markers
(4, 'demo-user', 'Troponin I', '0.08', 'ng/mL', '<0.04', '2024-02-02', 1, 'Dr. Sudha Banerjee'),
(4, 'demo-user', 'CK-MB', '8.5', 'ng/mL', '<6.3', '2024-02-02', 1, 'Dr. Sudha Banerjee'),
(9, 'demo-user', 'BNP', '450', 'pg/mL', '<100', '2024-03-08', 1, 'Dr. Kiran Rao'),
(9, 'demo-user', 'Ejection Fraction', '45', '%', '>55', '2024-03-08', 1, 'Dr. Kiran Rao'),
(17, 'demo-user', 'Troponin I', '0.06', 'ng/mL', '<0.04', '2024-04-14', 1, 'Dr. Shyam Agarwal'),
(17, 'demo-user', 'Total Cholesterol', '290', 'mg/dL', '<200', '2024-04-14', 1, 'Dr. Shyam Agarwal'),
(23, 'demo-user', 'INR', '2.8', 'ratio', '2.0-3.0', '2024-05-20', 0, 'Dr. Suresh Kumar'),
(23, 'demo-user', 'D-Dimer', '650', 'ng/mL', '<500', '2024-05-20', 1, 'Dr. Suresh Kumar'),

-- Liver function tests
(6, 'demo-user', 'ALT', '85', 'U/L', '<40', '2024-02-05', 1, 'Dr. Pradeep Sharma'),
(6, 'demo-user', 'AST', '92', 'U/L', '<40', '2024-02-05', 1, 'Dr. Pradeep Sharma'),
(10, 'demo-user', 'ALT', '58', 'U/L', '<40', '2024-03-12', 1, 'Dr. Dipak Sen'),
(10, 'demo-user', 'Bilirubin Total', '2.1', 'mg/dL', '<1.2', '2024-03-12', 1, 'Dr. Dipak Sen'),
(16, 'demo-user', 'ALT', '32', 'U/L', '<40', '2024-04-18', 0, 'Dr. Ritu Agarwal'),
(16, 'demo-user', 'AST', '28', 'U/L', '<40', '2024-04-18', 0, 'Dr. Ritu Agarwal'),
(20, 'demo-user', 'ALT', '95', 'U/L', '<40', '2024-05-24', 1, 'Dr. Kavitha Reddy'),
(20, 'demo-user', 'AST', '102', 'U/L', '<40', '2024-05-24', 1, 'Dr. Kavitha Reddy'),

-- Thyroid function tests
(12, 'demo-user', 'TSH', '12.5', 'mIU/L', '0.4-4.0', '2024-02-10', 1, 'Dr. Nirmala Shah'),
(12, 'demo-user', 'Free T4', '0.6', 'ng/dL', '0.8-1.8', '2024-02-10', 1, 'Dr. Nirmala Shah'),
(24, 'demo-user', 'TSH', '0.1', 'mIU/L', '0.4-4.0', '2024-03-16', 1, 'Dr. Pratima Joshi'),
(24, 'demo-user', 'Free T4', '3.2', 'ng/dL', '0.8-1.8', '2024-03-16', 1, 'Dr. Pratima Joshi'),
(24, 'demo-user', 'Free T3', '6.8', 'pg/mL', '2.3-4.2', '2024-03-16', 1, 'Dr. Pratima Joshi'),
(26, 'demo-user', 'TSH', '2.1', 'mIU/L', '0.4-4.0', '2024-04-20', 0, 'Dr. Neelam Verma'),
(26, 'demo-user', 'Free T4', '1.2', 'ng/dL', '0.8-1.8', '2024-04-20', 0, 'Dr. Neelam Verma'),

-- Inflammatory markers
(27, 'demo-user', 'ESR', '45', 'mm/hr', '<20', '2024-02-15', 1, 'Dr. Vinay Kumar'),
(27, 'demo-user', 'CRP', '12.5', 'mg/L', '<3.0', '2024-02-15', 1, 'Dr. Vinay Kumar'),
(27, 'demo-user', 'Rheumatoid Factor', '85', 'IU/mL', '<20', '2024-02-15', 1, 'Dr. Vinay Kumar'),
(28, 'demo-user', 'ESR', '28', 'mm/hr', '<20', '2024-03-22', 1, 'Dr. Jasbir Singh'),
(28, 'demo-user', 'CRP', '8.2', 'mg/L', '<3.0', '2024-03-22', 1, 'Dr. Jasbir Singh'),
(29, 'demo-user', 'ESR', '22', 'mm/hr', '<20', '2024-04-28', 1, 'Dr. Binod Das'),
(29, 'demo-user', 'CRP', '5.1', 'mg/L', '<3.0', '2024-04-28', 1, 'Dr. Binod Das'),
(30, 'demo-user', 'ESR', '35', 'mm/hr', '<20', '2024-05-25', 1, 'Dr. Priya Mohanty'),
(30, 'demo-user', 'CRP', '9.8', 'mg/L', '<3.0', '2024-05-25', 1, 'Dr. Priya Mohanty'),

-- Kidney function tests
(1, 'demo-user', 'Creatinine', '1.8', 'mg/dL', '0.6-1.2', '2024-01-15', 1, 'Dr. Anil Kumar'),
(1, 'demo-user', 'BUN', '28', 'mg/dL', '7-20', '2024-01-15', 1, 'Dr. Anil Kumar'),
(5, 'demo-user', 'Creatinine', '1.5', 'mg/dL', '0.6-1.2', '2024-02-20', 1, 'Dr. Vinod Gupta'),
(13, 'demo-user', 'Creatinine', '2.1', 'mg/dL', '0.6-1.2', '2024-03-10', 1, 'Dr. Rakesh Tiwari'),
(21, 'demo-user', 'Creatinine', '1.4', 'mg/dL', '0.6-1.2', '2024-04-12', 1, 'Dr. Rajendra Singh'),
(25, 'demo-user', 'Creatinine', '2.5', 'mg/dL', '0.6-1.2', '2024-05-18', 1, 'Dr. Ramesh Kumar'),

-- Vitamin deficiency common in India
(3, 'demo-user', 'Vitamin D', '18', 'ng/mL', '30-100', '2024-01-25', 1, 'Dr. Ravi Joshi'),
(8, 'demo-user', 'Vitamin B12', '180', 'pg/mL', '200-900', '2024-02-28', 1, 'Dr. Sonia Kapoor'),
(14, 'demo-user', 'Vitamin D', '15', 'ng/mL', '30-100', '2024-03-20', 1, 'Dr. Anjali Sinha'),
(18, 'demo-user', 'Iron', '45', 'mcg/dL', '60-170', '2024-04-25', 1, 'Dr. Hetal Desai'),
(22, 'demo-user', 'Vitamin D', '12', 'ng/mL', '30-100', '2024-05-30', 1, 'Dr. Sunita Sharma');
