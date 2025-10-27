
-- Create a mapping from old patient_id (1-30) to new patient_id (31-60)
-- Update medical_records to use correct patient IDs
UPDATE medical_records SET patient_id = patient_id + 30;

-- Update lab_results to use correct patient IDs
UPDATE lab_results SET patient_id = patient_id + 30;
