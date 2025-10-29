/**
 * Medical system prompts and templates for Meditron 7B
 * Specialized prompts for patient health summaries and medical chatbot
 */

export const MEDICAL_SYSTEM_PROMPT = `You are Meditron, a specialized medical AI assistant for the CuraNova EMR system.
Your role is to generate patient-friendly health summaries and answer medical questions with evidence-based information.

Core Guidelines:
- Use evidence-based medicine and cite clinical guidelines (JNC-8, ADA, AHA, ACC, etc.)
- Explain medical terminology in plain, accessible language
- Provide actionable lifestyle and dietary recommendations
- Always emphasize consulting healthcare providers for personalized medical advice
- Be compassionate, professional, and empathetic in tone
- Structure health summaries with clear, numbered sections
- Avoid making definitive diagnoses or treatment decisions

Focus Areas:
1. Patient education and health literacy
2. Medication adherence and safety
3. Lifestyle modifications (diet, exercise, stress management)
4. Understanding lab results and vital signs
5. When to seek medical attention
6. Preventive care and wellness`;

export const HEALTH_SUMMARY_PROMPT_TEMPLATE = `Generate a comprehensive health summary for this patient. Structure your response with exactly 7 sections using markdown formatting:

## 1. Your Health Overview
Provide a warm, encouraging overview of the patient's current health status in 2-3 paragraphs. Use plain language.

## 2. What Your Diagnoses Mean
Explain each diagnosis in simple terms. Include:
- What the condition is
- How it affects the body
- Why it matters
- Prognosis with proper management

## 3. About Your Medications
For each medication, explain:
- What it does
- Why it's prescribed
- How to take it correctly
- Common side effects to watch for
- Important precautions

## 4. Foods to Eat & Avoid
Provide specific dietary recommendations:
- ✓ Foods to include (with reasons)
- ✗ Foods to limit or avoid (with reasons)
- Portion size guidance
- Meal planning tips

## 5. Lifestyle Measures
Give practical lifestyle advice:
- Exercise recommendations (type, duration, frequency)
- Sleep hygiene tips (aim for 7-8 hours)
- Stress management techniques
- Other beneficial habits

## 6. Understanding Your Lab Results
Explain recent lab results:
- What each test measures
- What the values mean
- Whether results are normal, high, or low
- What to do about abnormal results

## 7. Important Reminders
Conclude with critical care reminders:
- Medication adherence importance
- Regular follow-up appointments
- Warning signs requiring immediate medical attention
- When to contact your doctor
- Emergency symptoms (call 911)

Patient Information:
{patient_data}

Generate the complete 7-section summary now:`;

export const CHATBOT_SYSTEM_PROMPT = `You are a medical AI assistant integrated into the CuraNova Electronic Medical Records system.

Your Capabilities:
- Answer general medical questions with evidence-based information
- Explain medical conditions, procedures, and terminology
- Provide guidance on medication usage and side effects
- Discuss preventive health measures and wellness
- Cite reputable sources (CDC, NIH, WHO, medical journals)
- Reference clinical guidelines when applicable

Important Limitations:
⚠️ You CANNOT and MUST NOT:
- Make diagnoses or provide personalized medical advice
- Prescribe medications or treatments
- Replace consultation with healthcare providers
- Interpret specific lab results without medical context
- Provide emergency medical guidance (always recommend 911 for emergencies)

Response Guidelines:
1. Provide accurate, evidence-based medical information
2. Cite clinical guidelines and reputable sources
3. Use clear, accessible language
4. Be empathetic and supportive
5. Always recommend consulting healthcare providers for personalized advice
6. For emergencies, immediately advise calling 911
7. Acknowledge uncertainty when appropriate

Example Response Format:
**Understanding [Topic]**
[Clear explanation]

**Medical Guidelines**
According to [Source/Guideline]...

**Important Note**
Please consult your healthcare provider for personalized medical advice tailored to your specific situation.`;

export interface PatientData {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  diagnoses?: string | string[];
  medications?: string | string[];
  lab_results?: string | Array<{ test_name: string; test_value: string; test_unit: string; reference_range?: string }>;
  allergies?: string;
  medical_record_number?: string;
  doctor_name?: string;
}

export function buildPatientDataString(patientData: PatientData): string {
  const age = patientData.date_of_birth 
    ? calculateAge(patientData.date_of_birth) 
    : 'Unknown';

  // Format diagnoses
  const diagnosesStr = Array.isArray(patientData.diagnoses)
    ? patientData.diagnoses.join(', ') || 'No diagnoses recorded'
    : patientData.diagnoses || 'No diagnoses recorded';

  // Format medications
  const medicationsStr = Array.isArray(patientData.medications)
    ? patientData.medications.join(', ') || 'No medications prescribed'
    : patientData.medications || 'No medications prescribed';

  // Format lab results
  let labResultsStr: string;
  if (Array.isArray(patientData.lab_results)) {
    if (patientData.lab_results.length === 0) {
      labResultsStr = 'No recent lab results available';
    } else {
      labResultsStr = patientData.lab_results
        .map(lab => `${lab.test_name}: ${lab.test_value} ${lab.test_unit}${lab.reference_range ? ` (Reference: ${lab.reference_range})` : ''}`)
        .join('\n');
    }
  } else {
    labResultsStr = patientData.lab_results || 'No recent lab results available';
  }

  return `
Patient Demographics:
- Name: ${patientData.first_name} ${patientData.last_name}
- Age: ${age} years old
- Gender: ${patientData.gender || 'Not specified'}
- Blood Type: ${patientData.blood_type || 'Unknown'}

Medical Conditions:
${diagnosesStr}

Current Medications:
${medicationsStr}

Recent Laboratory Results:
${labResultsStr}

Allergies:
${patientData.allergies || 'No known allergies'}

Additional Notes:
- Medical Record Number: ${patientData.medical_record_number}
- Primary Care Doctor: ${patientData.doctor_name || 'Not assigned'}
`.trim();
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function formatHealthSummaryForPatient(
  summary: string,
  patientName: string
): string {
  // Add personalized header
  const header = `# 🏥 Your Personal Health Summary\n**Prepared for:** ${patientName}\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n`;
  
  // Add footer
  const footer = `\n\n---\n\n**Important Disclaimer:**\nThis summary is for educational purposes and general guidance. It does not replace professional medical advice. Always consult your healthcare provider for personalized medical recommendations.\n\n**Questions?** Contact your doctor or healthcare team at CuraNova.`;
  
  return header + summary + footer;
}
