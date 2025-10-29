DELETE FROM lab_results
WHERE patient_id IN (
  SELECT id FROM patients
  WHERE email IN (
    'ananya.rao@email.com',
    'vikas.menon@email.com',
    'harini.prasad@email.com',
    'kabir.desai@email.com',
    'lakshmi.pillai@email.com'
  )
) AND user_id = 'demo-user';

DELETE FROM medical_records
WHERE patient_id IN (
  SELECT id FROM patients
  WHERE email IN (
    'ananya.rao@email.com',
    'vikas.menon@email.com',
    'harini.prasad@email.com',
    'kabir.desai@email.com',
    'lakshmi.pillai@email.com'
  )
) AND user_id = 'demo-user';

DELETE FROM patients
WHERE email IN (
  'ananya.rao@email.com',
  'vikas.menon@email.com',
  'harini.prasad@email.com',
  'kabir.desai@email.com',
  'lakshmi.pillai@email.com'
) AND user_id = 'demo-user';
