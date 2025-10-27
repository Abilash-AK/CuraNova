
-- Remove all test lab results
DELETE FROM lab_results WHERE user_id = 'test-user-1';

-- Remove all test medical records  
DELETE FROM medical_records WHERE user_id = 'test-user-1';

-- Remove all test patients
DELETE FROM patients WHERE user_id = 'test-user-1';
