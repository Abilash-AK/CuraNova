
-- Insert some sample medical data to ensure search functionality works
INSERT OR IGNORE INTO medical_records (patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription, notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature, weight, doctor_name) VALUES
(31, 'sample-user', '2024-01-15', 'High blood sugar levels', 'Type 2 Diabetes Mellitus', 'Metformin 500mg twice daily', 'Patient needs lifestyle changes and regular monitoring', 140, 90, 72, 98.6, 180, 'Dr. Smith'),
(31, 'sample-user', '2024-03-20', 'Follow-up diabetes check', 'Type 2 Diabetes Mellitus - controlled', 'Metformin 500mg twice daily, continue', 'Blood sugar levels improving', 135, 85, 70, 98.4, 175, 'Dr. Smith'),
(32, 'sample-user', '2024-02-10', 'Chest pain and shortness of breath', 'Hypertension', 'Lisinopril 10mg daily', 'Monitor blood pressure regularly', 160, 95, 80, 99.0, 190, 'Dr. Johnson'),
(32, 'sample-user', '2024-04-15', 'Blood pressure check', 'Hypertension - stable', 'Lisinopril 10mg daily', 'Continue current treatment', 145, 88, 75, 98.8, 185, 'Dr. Johnson'),
(33, 'sample-user', '2024-01-25', 'Severe headache and visual disturbances', 'Migraine', 'Sumatriptan as needed', 'Triggered by stress and lack of sleep', 120, 80, 68, 98.2, 140, 'Dr. Brown'),
(33, 'sample-user', '2024-03-10', 'Recurring headaches', 'Chronic Migraine', 'Propranolol 40mg daily', 'Preventive treatment started', 118, 78, 65, 98.1, 142, 'Dr. Brown'),
(34, 'sample-user', '2024-02-20', 'Fatigue and frequent urination', 'Type 1 Diabetes', 'Insulin therapy - Lantus and Humalog', 'Newly diagnosed, requires education', 125, 82, 70, 98.5, 160, 'Dr. Wilson'),
(35, 'sample-user', '2024-01-30', 'Joint pain and stiffness', 'Rheumatoid Arthritis', 'Methotrexate 15mg weekly', 'Autoimmune condition, monitor liver function', 130, 85, 72, 98.3, 155, 'Dr. Davis'),
(36, 'sample-user', '2024-03-05', 'Chest pain during exercise', 'Coronary Artery Disease', 'Atorvastatin 40mg daily', 'Requires cardiac catheterization', 150, 92, 78, 98.7, 200, 'Dr. Miller'),
(37, 'sample-user', '2024-02-14', 'Difficulty breathing', 'Asthma', 'Albuterol inhaler as needed', 'Environmental triggers identified', 125, 80, 85, 98.4, 165, 'Dr. Garcia'),
(38, 'sample-user', '2024-01-18', 'Memory problems and confusion', 'Early Alzheimer Disease', 'Donepezil 5mg daily', 'Cognitive decline noted', 135, 88, 70, 98.2, 170, 'Dr. Rodriguez'),
(39, 'sample-user', '2024-03-25', 'Mood swings and depression', 'Bipolar Disorder', 'Lithium 300mg twice daily', 'Psychiatric consultation recommended', 120, 75, 68, 98.6, 150, 'Dr. Lee'),
(40, 'sample-user', '2024-02-28', 'Persistent cough', 'Chronic Bronchitis', 'Prednisone 20mg daily', 'Smoking cessation counseling', 140, 85, 75, 99.1, 180, 'Dr. Taylor'),
(41, 'sample-user', '2024-01-12', 'High blood sugar', 'Gestational Diabetes', 'Insulin if diet fails', 'Pregnancy-related diabetes', 130, 80, 72, 98.5, 145, 'Dr. Anderson'),
(42, 'sample-user', '2024-03-08', 'Severe headache with nausea', 'Cluster Headache', 'Oxygen therapy', 'Different from typical migraines', 125, 78, 70, 98.3, 160, 'Dr. Thomas'),
(43, 'sample-user', '2024-02-16', 'High blood pressure reading', 'Secondary Hypertension', 'Amlodipine 5mg daily', 'Investigate underlying cause', 165, 100, 82, 98.8, 195, 'Dr. White'),
(44, 'sample-user', '2024-01-22', 'Thyroid problems', 'Hypothyroidism', 'Levothyroxine 50mcg daily', 'Annual thyroid function tests', 120, 75, 65, 97.8, 135, 'Dr. Martin'),
(45, 'sample-user', '2024-03-12', 'High cholesterol levels', 'Hyperlipidemia', 'Simvastatin 20mg daily', 'Diet and exercise counseling', 135, 85, 70, 98.4, 175, 'Dr. Clark'),
(46, 'sample-user', '2024-02-05', 'Kidney function decline', 'Chronic Kidney Disease', 'ACE inhibitor', 'Monitor creatinine levels', 145, 90, 75, 98.6, 185, 'Dr. Lewis'),
(47, 'sample-user', '2024-01-28', 'Bone density loss', 'Osteoporosis', 'Alendronate 70mg weekly', 'Calcium and vitamin D supplementation', 125, 80, 68, 98.2, 140, 'Dr. Walker');
