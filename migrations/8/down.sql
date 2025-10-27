
-- Revert medical_records patient_id back to 1-30 range
UPDATE medical_records SET patient_id = patient_id - 30;

-- Revert lab_results patient_id back to 1-30 range
UPDATE lab_results SET patient_id = patient_id - 30;
