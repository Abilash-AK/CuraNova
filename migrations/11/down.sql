
-- Remove all test data
DELETE FROM lab_results WHERE user_id = 'demo-user';
DELETE FROM medical_records WHERE user_id = 'demo-user';
DELETE FROM patients WHERE user_id = 'demo-user';
