
-- Remove all dummy data
DELETE FROM lab_results WHERE patient_id IN (1,2,3,4,5,6,7,8,9,10);
DELETE FROM medical_records WHERE patient_id IN (1,2,3,4,5,6,7,8,9,10);
DELETE FROM patients WHERE medical_record_number IN ('MRN001','MRN002','MRN003','MRN004','MRN005','MRN006','MRN007','MRN008','MRN009','MRN010');
