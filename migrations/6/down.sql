
-- Remove lab results for new patients
DELETE FROM lab_results WHERE patient_id IN (11, 12, 13, 14, 15, 16, 17, 18, 19, 20);

-- Remove medical records for new patients
DELETE FROM medical_records WHERE patient_id IN (11, 12, 13, 14, 15, 16, 17, 18, 19, 20);

-- Remove new patients
DELETE FROM patients WHERE id IN (11, 12, 13, 14, 15, 16, 17, 18, 19, 20);
