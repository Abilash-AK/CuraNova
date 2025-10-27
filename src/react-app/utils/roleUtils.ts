export type UserRole = 'doctor' | 'nurse' | 'patient' | 'unauthorized';

export function getUserRole(email: string): UserRole {
  if (!email) return 'unauthorized';
  
  // Check for doctor pattern: doctorname.01.doctor@gmail.com
  const doctorPattern = /^[a-zA-Z]+\.01\.doctor@gmail\.com$/;
  if (doctorPattern.test(email)) {
    return 'doctor';
  }
  
  // Check for nurse pattern: nursename.02.nurse@gmail.com
  const nursePattern = /^[a-zA-Z]+\.02\.nurse@gmail\.com$/;
  if (nursePattern.test(email)) {
    return 'nurse';
  }
  
  // Check for patient pattern: patientname.03.patient@gmail.com
  const patientPattern = /^[a-zA-Z]+\.03\.patient@gmail\.com$/;
  if (patientPattern.test(email)) {
    return 'patient';
  }
  
  return 'unauthorized';
}

export function canAccessAIFeatures(role: UserRole): boolean {
  return role === 'doctor';
}

export function canAccessSimilarCases(role: UserRole): boolean {
  return role === 'doctor';
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'doctor':
      return 'Doctor';
    case 'nurse':
      return 'Nurse';
    case 'patient':
      return 'Patient';
    default:
      return 'Unauthorized';
  }
}
