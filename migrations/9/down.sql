
-- Remove sample medical records
DELETE FROM medical_records WHERE patient_id BETWEEN 31 AND 47 AND user_id = 'sample-user';
