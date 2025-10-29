DELETE FROM lab_results
WHERE patient_id IN (
  SELECT id FROM patients
  WHERE email IN (
    'nisha.kapoor@email.com',
    'aravind.iyer@email.com',
    'sneha.kulkarni@email.com',
    'dev.singh@email.com',
    'rohan.batra@email.com',
    'gayatri.nambiar@email.com',
    'imran.khan@email.com',
    'tanvi.shah@email.com',
    'vivek.suri@email.com',
    'maya.krishnan@email.com',
    'siddharth.bose@email.com',
    'asha.fernandes@email.com',
    'pranav.shetty@email.com',
    'pallavi.chawla@email.com',
    'yusuf.qureshi@email.com'
  )
) AND user_id = 'demo-user';

DELETE FROM medical_records
WHERE patient_id IN (
  SELECT id FROM patients
  WHERE email IN (
    'nisha.kapoor@email.com',
    'aravind.iyer@email.com',
    'sneha.kulkarni@email.com',
    'dev.singh@email.com',
    'rohan.batra@email.com',
    'gayatri.nambiar@email.com',
    'imran.khan@email.com',
    'tanvi.shah@email.com',
    'vivek.suri@email.com',
    'maya.krishnan@email.com',
    'siddharth.bose@email.com',
    'asha.fernandes@email.com',
    'pranav.shetty@email.com',
    'pallavi.chawla@email.com',
    'yusuf.qureshi@email.com'
  )
) AND user_id = 'demo-user';

DELETE FROM patients
WHERE email IN (
  'nisha.kapoor@email.com',
  'aravind.iyer@email.com',
  'sneha.kulkarni@email.com',
  'dev.singh@email.com',
  'rohan.batra@email.com',
  'gayatri.nambiar@email.com',
  'imran.khan@email.com',
  'tanvi.shah@email.com',
  'vivek.suri@email.com',
  'maya.krishnan@email.com',
  'siddharth.bose@email.com',
  'asha.fernandes@email.com',
  'pranav.shetty@email.com',
  'pallavi.chawla@email.com',
  'yusuf.qureshi@email.com'
) AND user_id = 'demo-user';
