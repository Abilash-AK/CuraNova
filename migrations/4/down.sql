-- Remove test lab results for Lisa Thompson
DELETE FROM lab_results WHERE patient_id IN (
  SELECT id FROM patients WHERE first_name = 'Lisa' AND last_name = 'Thompson' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'
);

-- Remove test lab results for David Kim
DELETE FROM lab_results WHERE patient_id IN (
  SELECT id FROM patients WHERE first_name = 'David' AND last_name = 'Kim' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'
);

-- Remove test lab results for Emily Rodriguez
DELETE FROM lab_results WHERE patient_id IN (
  SELECT id FROM patients WHERE first_name = 'Emily' AND last_name = 'Rodriguez' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'
);

-- Remove test medical records for Lisa Thompson
DELETE FROM medical_records WHERE patient_id IN (
  SELECT id FROM patients WHERE first_name = 'Lisa' AND last_name = 'Thompson' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'
);

-- Remove test medical records for David Kim
DELETE FROM medical_records WHERE patient_id IN (
  SELECT id FROM patients WHERE first_name = 'David' AND last_name = 'Kim' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'
);

-- Remove test medical records for Emily Rodriguez
DELETE FROM medical_records WHERE patient_id IN (
  SELECT id FROM patients WHERE first_name = 'Emily' AND last_name = 'Rodriguez' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64'
);

-- Remove test patients
DELETE FROM patients WHERE first_name = 'Lisa' AND last_name = 'Thompson' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64';
DELETE FROM patients WHERE first_name = 'David' AND last_name = 'Kim' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64';
DELETE FROM patients WHERE first_name = 'Emily' AND last_name = 'Rodriguez' AND user_id = '01995c67-a41a-7dde-842d-2b7475566a64';