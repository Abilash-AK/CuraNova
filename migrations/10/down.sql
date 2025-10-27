
-- Remove sample lab results
DELETE FROM lab_results WHERE patient_id BETWEEN 31 AND 47 AND user_id = 'sample-user';
