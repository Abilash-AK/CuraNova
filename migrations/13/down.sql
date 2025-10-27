
-- Remove sample data
DELETE FROM lab_results WHERE patient_id IN (1, 2, 3);
DELETE FROM medical_records WHERE patient_id IN (1, 2, 3);
DELETE FROM patients WHERE medical_record_number IN ('MRN001', 'MRN002', 'MRN003');

-- Drop indexes
DROP INDEX IF EXISTS idx_patient_sessions_mrn;
DROP INDEX IF EXISTS idx_patient_sessions_token;

-- Drop table
DROP TABLE IF EXISTS patient_sessions;
