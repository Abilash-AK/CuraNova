
-- Insert some lab results for better search functionality
INSERT OR IGNORE INTO lab_results (patient_id, user_id, test_name, test_value, test_unit, reference_range, test_date, is_abnormal, doctor_name) VALUES
(31, 'sample-user', 'Hemoglobin A1C', '8.2', '%', '4.0-5.6', '2024-01-15', 1, 'Dr. Smith'),
(31, 'sample-user', 'Fasting Glucose', '165', 'mg/dL', '70-100', '2024-01-15', 1, 'Dr. Smith'),
(32, 'sample-user', 'Blood Pressure', '160/95', 'mmHg', '<120/80', '2024-02-10', 1, 'Dr. Johnson'),
(32, 'sample-user', 'Cholesterol Total', '245', 'mg/dL', '<200', '2024-02-10', 1, 'Dr. Johnson'),
(33, 'sample-user', 'MRI Brain', 'Normal', '', 'Normal', '2024-01-25', 0, 'Dr. Brown'),
(34, 'sample-user', 'Random Glucose', '320', 'mg/dL', '70-140', '2024-02-20', 1, 'Dr. Wilson'),
(34, 'sample-user', 'C-Peptide', '0.8', 'ng/mL', '1.1-4.4', '2024-02-20', 1, 'Dr. Wilson'),
(35, 'sample-user', 'Rheumatoid Factor', '85', 'IU/mL', '<20', '2024-01-30', 1, 'Dr. Davis'),
(35, 'sample-user', 'CRP', '12.5', 'mg/L', '<3.0', '2024-01-30', 1, 'Dr. Davis'),
(36, 'sample-user', 'Troponin I', '0.15', 'ng/mL', '<0.04', '2024-03-05', 1, 'Dr. Miller'),
(36, 'sample-user', 'LDL Cholesterol', '180', 'mg/dL', '<100', '2024-03-05', 1, 'Dr. Miller'),
(37, 'sample-user', 'Peak Flow', '250', 'L/min', '400-600', '2024-02-14', 1, 'Dr. Garcia'),
(38, 'sample-user', 'Mini Mental State', '22', 'points', '24-30', '2024-01-18', 1, 'Dr. Rodriguez'),
(39, 'sample-user', 'Lithium Level', '0.8', 'mEq/L', '0.6-1.2', '2024-03-25', 0, 'Dr. Lee'),
(40, 'sample-user', 'Chest X-Ray', 'Abnormal', '', 'Normal', '2024-02-28', 1, 'Dr. Taylor');
