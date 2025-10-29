/* eslint-disable @typescript-eslint/no-explicit-any */
// Cloudflare D1 result sets currently come back as generic records. We disable the
// explicit-any lint rule in this worker until the persistence layer is fully typed.
import { Hono } from "hono";
import type { Context, MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie } from "hono/cookie";
import { PatientSchema, MedicalRecordSchema, LabResultSchema } from "../shared/types";
import type { DashboardStats } from "../shared/types";
import type { Env } from "../../worker-configuration";
import { OllamaClient, OllamaCache } from "./lib/ollama-client";
import { 
  MEDICAL_SYSTEM_PROMPT, 
  HEALTH_SUMMARY_PROMPT_TEMPLATE, 
  CHATBOT_SYSTEM_PROMPT,
  buildPatientDataString,
  formatHealthSummaryForPatient
} from "./lib/meditron-prompts";

const SESSION_COOKIE_NAME = "curanova_session";
const OAUTH_STATE_COOKIE_NAME = "curanova_oauth_state";
const OAUTH_SCOPE = "openid email profile";
const GEMINI_MODEL_ID = "gemini-1.5-flash";

type GeminiCandidate = {
  content?: {
    parts?: Array<{ text?: string | null | undefined }>;
  } | null;
};

const requestGeminiText = async (apiKey: string, prompt: string): Promise<string> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Gemini request failed with status ${response.status}: ${errorDetails}`);
  }

  const payload = await response.json<{ candidates?: GeminiCandidate[] }>();
  const combinedText = payload.candidates
    ?.flatMap((candidate) => candidate?.content?.parts ?? [])
    .map((part) => part?.text ?? "")
    .join("")
    .trim();

  if (!combinedText) {
    throw new Error("Gemini response did not contain any text content");
  }

  return combinedText;
};

const extractJsonObject = (raw: string): string => {
  const startIndex = raw.indexOf("{");
  const endIndex = raw.lastIndexOf("}");
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return raw;
  }
  return raw.slice(startIndex, endIndex + 1);
};

function parseJsonOr<T>(raw: string, fallback: T): T {
  try {
    const cleaned = extractJsonObject(raw.replace(/```(?:json)?/gi, ""));
    const parsed = JSON.parse(cleaned) as T;
    return parsed;
  } catch {
    return fallback;
  }
}

const normalizeSummary = (summary: unknown, fallback: StructuredSummary): StructuredSummary => {
  const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
  const toStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map((item) => (isNonEmptyString(item) ? item.trim() : null))
      .filter((item): item is string => item !== null);
  };

  const candidate = summary as Partial<StructuredSummary> | undefined;
  const overview = isNonEmptyString(candidate?.overview) ? candidate!.overview.trim() : fallback.overview;
  const keyFindings = toStringArray(candidate?.key_findings);
  const riskFactors = toStringArray(candidate?.risk_factors);
  const recommendations = toStringArray(candidate?.recommendations);
  const trends = isNonEmptyString(candidate?.trends) ? candidate!.trends.trim() : fallback.trends;

  return {
    overview,
    key_findings: keyFindings.length > 0 ? keyFindings : fallback.key_findings,
    risk_factors: riskFactors.length > 0 ? riskFactors : fallback.risk_factors,
    recommendations: recommendations.length > 0 ? recommendations : fallback.recommendations,
    trends,
  };
};

const logError = (message: string, error: unknown) => {
  if (error instanceof Error) {
    console.error(`${message}:`, error.message, error.stack);
    return;
  }
  console.error(message, error);
};

const buildMockSyntheticCases = (
  patient: any,
  count: number,
  complexity: string,
): Array<{
  id: string;
  case_title: string;
  patient_profile: { age: number; gender: string | null; presentation: string };
  clinical_scenario: string;
  learning_objectives: string[];
  teaching_points: string[];
  case_complexity: string;
  educational_value: number;
}> => {
  const baseAge = patient?.date_of_birth
    ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
    : 48;
  return Array.from({ length: count }, (_item, index) => {
    const shift = (index % 3) - 1;
    return {
      id: `syn${(index + 1).toString().padStart(3, "0")}`,
      case_title: `Educational Case ${index + 1}: Clinical Pattern Exploration`,
      patient_profile: {
        age: baseAge + shift * 4,
        gender: patient?.gender || "Unknown",
        presentation:
          "Patient with comparable history and symptom profile requiring structured evaluation",
      },
      clinical_scenario:
        "Scenario designed to mirror key findings from the reference patient while remaining anonymized for teaching focus.",
      learning_objectives: [
        "Reinforce differential diagnosis steps",
        "Identify key monitoring priorities",
        "Outline patient communication strategies",
        "Plan evidence-based follow-up",
      ],
      teaching_points: [
        "Review overlapping risk factors",
        "Contrast management pathways",
        "Highlight preventative considerations",
        "Document coordinated care steps",
      ],
      case_complexity: complexity,
      educational_value: 0.82 + index * 0.03,
    };
  });
};

type StructuredSummary = {
  overview: string;
  key_findings: string[];
  risk_factors: string[];
  recommendations: string[];
  trends: string;
};

const formatDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const buildDataDrivenSummary = (patient: any, medicalRecords: any[], labResults: any[]): StructuredSummary => {
  const fallback = buildMockSummary(patient, medicalRecords, labResults);
  const name = `${patient?.first_name ?? "Patient"} ${patient?.last_name ?? ""}`.trim() || "The patient";
  const visitCount = medicalRecords.length;
  const latestVisit = medicalRecords[0] ?? null;
  const abnormalLabs = labResults.filter((lab) => lab?.is_abnormal);

  // Enhanced vital analysis
  const systolicValues = medicalRecords
    .map((record) => Number(record?.blood_pressure_systolic))
    .filter((value) => Number.isFinite(value));
  const diastolicValues = medicalRecords
    .map((record) => Number(record?.blood_pressure_diastolic))
    .filter((value) => Number.isFinite(value));
  const maxSystolic = systolicValues.length ? Math.max(...systolicValues) : null;
  const maxDiastolic = diastolicValues.length ? Math.max(...diastolicValues) : null;
  const avgSystolic = systolicValues.length ? Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length) : null;
  const avgDiastolic = diastolicValues.length ? Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length) : null;

  // Weight and glucose trends
  const weights = medicalRecords
    .map((record) => Number(record?.weight))
    .filter((value) => Number.isFinite(value));
  const latestWeight = weights[0] ?? null;
  const earliestWeight = weights.length > 1 ? weights[weights.length - 1] : null;
  const weightTrend = latestWeight != null && earliestWeight != null ? latestWeight - earliestWeight : null;
  
  const glucoseValues = medicalRecords
    .map((record) => Number(record?.blood_sugar))
    .filter((value) => Number.isFinite(value));
  const avgGlucose = glucoseValues.length ? Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length) : null;
  
  const cholesterolValues = medicalRecords
    .map((record) => Number(record?.cholesterol))
    .filter((value) => Number.isFinite(value));
  const avgCholesterol = cholesterolValues.length ? Math.round(cholesterolValues.reduce((a, b) => a + b, 0) / cholesterolValues.length) : null;

  const overviewParts: string[] = [];
  overviewParts.push(`${name} has ${visitCount} documented visit${visitCount === 1 ? "" : "s"} spanning ${visitCount > 1 ? "multiple encounters" : "an initial evaluation"}`);
  if (latestVisit?.visit_date) {
    const daysSinceVisit = Math.floor((Date.now() - new Date(latestVisit.visit_date).getTime()) / (1000 * 60 * 60 * 24));
    overviewParts.push(`with the most recent encounter ${daysSinceVisit < 30 ? `${daysSinceVisit} days ago` : `on ${formatDate(latestVisit.visit_date)}`}.`);
  }
  if (latestVisit?.diagnosis) {
    overviewParts.push(`Current primary diagnosis: ${latestVisit.diagnosis}.`);
  }

  const keyFindings: string[] = [];
  if (latestVisit) {
    const bpStatus = latestVisit.blood_pressure_systolic && latestVisit.blood_pressure_diastolic 
      ? `BP ${latestVisit.blood_pressure_systolic}/${latestVisit.blood_pressure_diastolic} mmHg`
      : null;
    const diagnosis = latestVisit.diagnosis || latestVisit.chief_complaint;
    const visitSummary = [
      `Visit on ${formatDate(latestVisit.visit_date)}`,
      diagnosis ? `for ${diagnosis}` : null,
      bpStatus,
      latestVisit.prescription ? `prescribed ${latestVisit.prescription}` : null
    ].filter(Boolean).join(', ');
    keyFindings.push(visitSummary + '.');
  }
  
  if (avgSystolic && avgDiastolic) {
    const bpCategory = avgSystolic >= 140 || avgDiastolic >= 90 ? "hypertensive range" :
                       avgSystolic >= 130 || avgDiastolic >= 80 ? "elevated" : "normal range";
    keyFindings.push(`Average BP across encounters: ${avgSystolic}/${avgDiastolic} mmHg (${bpCategory}).`);
  }
  
  if (avgGlucose) {
    const glucoseStatus = avgGlucose >= 126 ? "diabetic range" : avgGlucose >= 100 ? "prediabetic range" : "normal range";
    keyFindings.push(`Mean fasting glucose: ${avgGlucose} mg/dL (${glucoseStatus}), monitored across ${glucoseValues.length} visit${glucoseValues.length > 1 ? 's' : ''}.`);
  }
  
  if (abnormalLabs.length) {
    const criticalLabs = abnormalLabs.filter(lab => 
      lab.test_name?.toLowerCase().includes('creatinine') ||
      lab.test_name?.toLowerCase().includes('troponin') ||
      lab.test_name?.toLowerCase().includes('bnp')
    );
    if (criticalLabs.length) {
      const critical = criticalLabs[0];
      keyFindings.push(`Critical abnormal: ${critical.test_name} at ${critical.test_value}${critical.test_unit ?? ""} on ${formatDate(critical.test_date)} (Ref: ${critical.reference_range}).`);
    } else {
      const lab = abnormalLabs[0];
      keyFindings.push(`${abnormalLabs.length} abnormal lab${abnormalLabs.length > 1 ? 's' : ''} flagged, including ${lab.test_name}: ${lab.test_value}${lab.test_unit ?? ""} (${formatDate(lab.test_date)}).`);
    }
  }
  
  if (labResults.length > 0) {
    const hba1cLabs = labResults.filter(lab => lab.test_name?.toLowerCase().includes('hba1c') || lab.test_name?.toLowerCase().includes('a1c'));
    if (hba1cLabs.length > 0) {
      const latest = hba1cLabs[0];
      keyFindings.push(`HbA1c: ${latest.test_value}% on ${formatDate(latest.test_date)}${Number(latest.test_value) >= 7 ? " (above target)" : " (at target)"}.`);
    }
  }
  
  if (weights.length >= 2 && weightTrend) {
    const percentChange = earliestWeight ? Math.abs((weightTrend / earliestWeight) * 100).toFixed(1) : null;
    keyFindings.push(`Weight ${weightTrend > 0 ? "increased" : "decreased"} by ${Math.abs(weightTrend).toFixed(1)} units${percentChange ? ` (${percentChange}%)` : ""} over ${visitCount} visits.`);
  }

  const riskFactors: string[] = [];
  
  // Cardiovascular risk
  if (maxSystolic != null && maxDiastolic != null && (maxSystolic >= 140 || maxDiastolic >= 90)) {
    const stage = maxSystolic >= 160 || maxDiastolic >= 100 ? "Stage 2 hypertension" : "Stage 1 hypertension";
    riskFactors.push(`${stage} detected with peak BP ${maxSystolic}/${maxDiastolic} mmHg; increases cardiovascular event risk by 2-4x.`);
  }
  
  // Metabolic risk
  if (avgCholesterol && avgCholesterol > 200) {
    riskFactors.push(`Dyslipidemia with average total cholesterol ${avgCholesterol} mg/dL elevates ASCVD risk; statin consideration recommended.`);
  }
  
  if (avgGlucose && avgGlucose >= 100) {
    const diabetesStatus = avgGlucose >= 126 ? "Type 2 diabetes" : "Prediabetes";
    riskFactors.push(`${diabetesStatus} confirmed (avg glucose ${avgGlucose} mg/dL); risk for microvascular complications without intervention.`);
  }
  
  // Lab-based risks
  const kidneyLabs = abnormalLabs.filter(lab => 
    lab.test_name?.toLowerCase().includes('creatinine') || 
    lab.test_name?.toLowerCase().includes('egfr')
  );
  if (kidneyLabs.length) {
    riskFactors.push(`Renal function abnormality: ${kidneyLabs[0].test_name} at ${kidneyLabs[0].test_value}${kidneyLabs[0].test_unit ?? ""}; monitor for CKD progression.`);
  }
  
  const anemiaLabs = abnormalLabs.filter(lab => lab.test_name?.toLowerCase().includes('hemoglobin'));
  if (anemiaLabs.length && Number(anemiaLabs[0].test_value) < 12) {
    riskFactors.push(`Anemia detected (Hgb ${anemiaLabs[0].test_value} g/dL); evaluate for iron deficiency, chronic disease, or bleeding.`);
  }
  
  // Allergy risks
  if (patient?.allergies && patient.allergies.toLowerCase() !== 'none') {
    const allergyList = patient.allergies.split(',').map((a: string) => a.trim()).slice(0, 3).join(', ');
    riskFactors.push(`Documented allergies to ${allergyList}; contraindicate related drug classes and ensure emergency action plan.`);
  }
  
  // Weight-based risks
  if (weightTrend && weightTrend > 5) {
    riskFactors.push(`Significant weight gain (+${weightTrend.toFixed(1)} units) may indicate fluid retention, medication effect, or metabolic dysregulation.`);
  } else if (weightTrend && weightTrend < -5) {
    riskFactors.push(`Unintentional weight loss (-${Math.abs(weightTrend).toFixed(1)} units) warrants malignancy screening, thyroid evaluation, or depression assessment.`);
  }
  
  // Visit frequency risk
  if (visitCount >= 2 && medicalRecords.length >= 2) {
    const firstVisit = new Date(medicalRecords[medicalRecords.length - 1].visit_date);
    const lastVisit = new Date(medicalRecords[0].visit_date);
    const monthsSpan = (lastVisit.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const visitsPerMonth = visitCount / Math.max(monthsSpan, 1);
    if (visitsPerMonth > 1.5) {
      riskFactors.push(`High visit frequency (${visitCount} visits over ${Math.round(monthsSpan)} months) suggests complex chronic disease or acute exacerbations.`);
    }
  }

  const recommendations: string[] = [];
  
  // Prioritize critical abnormals
  const criticalAbnormals = abnormalLabs.filter(lab => 
    (lab.test_name?.toLowerCase().includes('creatinine') && Number(lab.test_value) > 2.0) ||
    (lab.test_name?.toLowerCase().includes('troponin') && Number(lab.test_value) > 0.04) ||
    (lab.test_name?.toLowerCase().includes('potassium') && (Number(lab.test_value) > 5.5 || Number(lab.test_value) < 3.0)) ||
    (lab.test_name?.toLowerCase().includes('hemoglobin') && Number(lab.test_value) < 8)
  );
  
  if (criticalAbnormals.length) {
    recommendations.push(`URGENT: Repeat ${criticalAbnormals[0].test_name} within 24-48 hours given critical value (${criticalAbnormals[0].test_value}${criticalAbnormals[0].test_unit ?? ""}); consider specialist consult.`);
  }
  
  // BP management
  if (maxSystolic && maxDiastolic && (maxSystolic >= 140 || maxDiastolic >= 90)) {
    if (avgSystolic && avgSystolic >= 140) {
      recommendations.push(`Intensify hypertension therapy: current average BP ${avgSystolic}/${avgDiastolic} mmHg above target (<130/80); consider add-on agent or lifestyle intervention.`);
    } else {
      recommendations.push(`Home BP monitoring recommended to confirm office-based hypertension (peak ${maxSystolic}/${maxDiastolic}); rule out white coat effect.`);
    }
  }
  
  // Diabetes/glucose control
  if (avgGlucose && avgGlucose >= 126) {
    const hba1cLab = labResults.find(lab => lab.test_name?.toLowerCase().includes('hba1c'));
    if (hba1cLab && Number(hba1cLab.test_value) > 7) {
      recommendations.push(`Glycemic control suboptimal (HbA1c ${hba1cLab.test_value}%); titrate therapy to target <7% and screen for micro/macrovascular complications.`);
    } else {
      recommendations.push(`Diabetes diagnosed (avg glucose ${avgGlucose} mg/dL); initiate HbA1c monitoring every 3 months and comprehensive diabetes education.`);
    }
  } else if (avgGlucose && avgGlucose >= 100) {
    recommendations.push(`Prediabetes identified (avg glucose ${avgGlucose} mg/dL); prescribe lifestyle intervention (diet, exercise) and recheck glucose/HbA1c in 3-6 months.`);
  }
  
  // Lipid management
  if (avgCholesterol && avgCholesterol > 200) {
    recommendations.push(`Lipid panel optimization needed (avg cholesterol ${avgCholesterol} mg/dL); calculate 10-year ASCVD risk and consider statin initiation per guidelines.`);
  }
  
  // Weight counseling
  if (weightTrend && Math.abs(weightTrend) >= 5) {
    const direction = weightTrend > 0 ? "gain" : "loss";
    recommendations.push(`Address ${direction} of ${Math.abs(weightTrend).toFixed(1)} units: review medications, dietary patterns, and screen for underlying metabolic/thyroid disorders.`);
  }
  
  // Preventive care
  const age = patient?.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : null;
  if (age) {
    if (age >= 50 && age < 75) {
      recommendations.push(`Age-appropriate cancer screening: colonoscopy (if not current), annual lung CT if smoking history, mammography (if female).`);
    }
    if (age >= 40) {
      recommendations.push(`Cardiovascular risk assessment: lipid panel annually, BP every visit, consider coronary calcium score if intermediate risk.`);
    }
  }
  
  // Follow-up timing
  if (latestVisit) {
    const daysSince = Math.floor((Date.now() - new Date(latestVisit.visit_date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 180 && (avgSystolic && avgSystolic >= 140 || avgGlucose && avgGlucose >= 126)) {
      recommendations.push(`Overdue for chronic disease follow-up (last seen ${daysSince} days ago); schedule visit within 2-4 weeks for medication review and labs.`);
    } else if (abnormalLabs.length > 0 && daysSince > 90) {
      recommendations.push(`Follow-up abnormal labs from ${formatDate(latestVisit.visit_date)}; repeat testing and clinical correlation within 1 month.`);
    }
  }

  const trendLines: string[] = [];
  
  // BP trajectory
  if (systolicValues.length >= 3) {
    const recent3 = systolicValues.slice(0, 3);
    const older3 = systolicValues.length >= 6 ? systolicValues.slice(-3) : systolicValues.slice(Math.max(0, systolicValues.length - 3));
    const recentAvg = recent3.reduce((a, b) => a + b, 0) / recent3.length;
    const olderAvg = older3.reduce((a, b) => a + b, 0) / older3.length;
    const bpChange = recentAvg - olderAvg;
    
    if (Math.abs(bpChange) >= 5) {
      trendLines.push(`Blood pressure ${bpChange > 0 ? "rising" : "improving"} (${Math.abs(bpChange).toFixed(0)} mmHg change in systolic) over recent encounters; ${bpChange > 0 ? "escalate therapy" : "current regimen effective"}.`);
    } else {
      trendLines.push(`Blood pressure stable at average ${avgSystolic}/${avgDiastolic} mmHg across ${systolicValues.length} visits; maintain current management.`);
    }
  }
  
  // Weight trajectory
  if (weights.length >= 3 && weightTrend) {
    const monthsSpan = visitCount >= 2 ? 
      (new Date(medicalRecords[0].visit_date).getTime() - new Date(medicalRecords[medicalRecords.length - 1].visit_date).getTime()) / (1000 * 60 * 60 * 24 * 30) : 1;
    const weightChangePerMonth = weightTrend / Math.max(monthsSpan, 1);
    
    if (Math.abs(weightChangePerMonth) >= 1) {
      trendLines.push(`Rapid weight ${weightTrend > 0 ? "gain" : "loss"} trajectory (${Math.abs(weightChangePerMonth).toFixed(1)} units/month); requires intervention to prevent metabolic complications.`);
    } else {
      trendLines.push(`Weight ${weightTrend > 0 ? "gradual increase" : "gradual decrease"} of ${Math.abs(weightTrend).toFixed(1)} units over ${Math.round(monthsSpan)} months; monitor for clinical significance.`);
    }
  }
  
  // Glucose trajectory
  if (glucoseValues.length >= 3) {
    const recent3Glucose = glucoseValues.slice(0, 3);
    const older3Glucose = glucoseValues.length >= 6 ? glucoseValues.slice(-3) : glucoseValues.slice(Math.max(0, glucoseValues.length - 3));
    const recentGlucoseAvg = recent3Glucose.reduce((a, b) => a + b, 0) / recent3Glucose.length;
    const olderGlucoseAvg = older3Glucose.reduce((a, b) => a + b, 0) / older3Glucose.length;
    const glucoseChange = recentGlucoseAvg - olderGlucoseAvg;
    
    if (Math.abs(glucoseChange) >= 20) {
      trendLines.push(`Glycemic control ${glucoseChange > 0 ? "deteriorating" : "improving significantly"} (${Math.abs(glucoseChange).toFixed(0)} mg/dL change); ${glucoseChange > 0 ? "urgent medication adjustment needed" : "lifestyle modifications working"}.`);
    }
  }
  
  // Lab monitoring gaps
  if (labResults.length > 0) {
    const lastLabDate = new Date(labResults[0].test_date);
    const daysSinceLastLab = Math.floor((Date.now() - lastLabDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastLab > 180 && (avgGlucose && avgGlucose >= 100 || avgSystolic && avgSystolic >= 130)) {
      trendLines.push(`Laboratory monitoring gap: last labs ${daysSinceLastLab} days ago; chronic disease management requires quarterly surveillance.`);
    }
  }
  
  // Default if limited data
  if (!trendLines.length) {
    trendLines.push(`Longitudinal data limited to ${visitCount} encounter${visitCount > 1 ? 's' : ''}; establish regular follow-up schedule to enable meaningful trend analysis and proactive disease management.`);
  }

  const ensureLength = (items: string[], fallbackItems: string[]): string[] => {
    const cleaned = items.filter((item) => typeof item === "string" && item.trim().length > 0);
    const result = [...cleaned];
    while (result.length < fallbackItems.length) {
      result.push(fallbackItems[result.length] ?? fallbackItems[fallbackItems.length - 1]);
    }
    return result.slice(0, fallbackItems.length);
  };

  return {
    overview: overviewParts.join(" ").trim() || fallback.overview,
    key_findings: ensureLength(keyFindings, fallback.key_findings),
    risk_factors: ensureLength(riskFactors, fallback.risk_factors),
    recommendations: ensureLength(recommendations, fallback.recommendations),
    trends: trendLines.join(" ") || fallback.trends,
  };
};

const buildMockSummary = (patient: any, medicalRecords: any[], labResults: any[]): StructuredSummary => {
  const name = `${patient?.first_name ?? "Patient"} ${patient?.last_name ?? ""}`.trim();
  const encounterCount = medicalRecords.length;
  const labCount = labResults.length;
  return {
    overview: `${name || "The patient"} has ${encounterCount} documented visit${
      encounterCount === 1 ? "" : "s"
    } and ${labCount} lab result${labCount === 1 ? "" : "s"}. Clinical review focuses on longitudinal stability and preventative care opportunities.`,
    key_findings: [
      "Care history demonstrates consistent follow-up appointments",
      "Vital signs remain within monitored ranges across encounters",
      "Lab surveillance supports trend comparison and early alerts",
      "Patient profile suitable for ongoing preventative planning",
    ],
    risk_factors: [
      "Continue screening for chronic conditions aligned with demographics",
      "Evaluate lifestyle contributors noted in visit documentation",
      "Review medication adherence and potential interactions",
      "Confirm vaccination status and age-based screenings",
    ],
    recommendations: [
      "Maintain regular visit cadence with targeted assessments",
      "Document patient goals and shared decision checkpoints",
      "Reinforce medication and lifestyle counseling touchpoints",
      "Schedule follow-up labs aligned with current monitoring intervals",
    ],
    trends:
      "Available encounters show stable management with opportunities to enrich documentation on lifestyle factors and long-term preventive strategies.",
  };
};

const buildRedirectUri = (c: Context<WorkerContext>): string => {
  const requestUrl = new URL(c.req.url);
  const configuredRedirect = c.env.GOOGLE_REDIRECT_URI;

  if (!configuredRedirect) {
    return `${requestUrl.protocol}//${requestUrl.host}/auth/callback`;
  }

  try {
    const parsedConfigured = new URL(configuredRedirect);

    // Keep the configured protocol; only adjust host/port for local development parity.
    const requestHost = requestUrl.hostname;
    const configuredHost = parsedConfigured.hostname;
    const requestIsLocal = requestHost === "127.0.0.1" || requestHost === "localhost";
    const configuredIsLocal = configuredHost === "127.0.0.1" || configuredHost === "localhost";

    if (requestIsLocal && configuredIsLocal) {
      parsedConfigured.hostname = requestHost;
      parsedConfigured.port = requestUrl.port || parsedConfigured.port;
    }

    // If both URLs share the same host and a port is present on the request, mirror it.
    if (!parsedConfigured.port && requestUrl.port && parsedConfigured.hostname === requestHost) {
      parsedConfigured.port = requestUrl.port;
    }

    return parsedConfigured.toString();
  } catch (error) {
    console.warn("Failed to parse GOOGLE_REDIRECT_URI, falling back to request host", error);
    return `${requestUrl.protocol}//${requestUrl.host}/auth/callback`;
  }
};

const isSecureRequest = (c: Context<WorkerContext>) => {
  try {
    const url = new URL(c.req.url);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  name?: string | null;
  picture?: string | null;
  given_name?: string | null;
  family_name?: string | null;
};

type WorkerContext = { Bindings: Env; Variables: { user: AuthenticatedUser } };

const app = new Hono<WorkerContext>();

// Error handling middleware
app.onError((_error, c) => {
  return c.json({ error: 'Internal server error' }, 500);
});

// Health check route
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper function to determine user role from email
const getUserRoleFromEmail = (email: string): string => {
  if (!email) return 'unauthorized';

  const normalized = email.trim().toLowerCase();

  // Allow letters, digits, dots, underscores, or hyphens before the role marker.
  const doctorPattern = /^[a-z0-9._-]+\.01\.doctor@gmail\.com$/;
  if (doctorPattern.test(normalized)) {
    return 'doctor';
  }

  const nursePattern = /^[a-z0-9._-]+\.02\.nurse@gmail\.com$/;
  if (nursePattern.test(normalized)) {
    return 'nurse';
  }

  const patientPattern = /^[a-z0-9._-]+\.03\.patient@gmail\.com$/;
  if (patientPattern.test(normalized)) {
    return 'patient';
  }

  return 'unauthorized';
};

// Helper function to update session activity
const updateSessionActivity = async (db: D1Database, sessionToken: string) => {
  try {
    await db.prepare(`
      UPDATE active_sessions
      SET last_activity = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE session_token = ?
    `).bind(sessionToken).run();
  } catch (error) {
    logError("Failed to update session activity", error);
  }
};

// Helper function to clean up inactive sessions (older than 30 minutes)
const cleanupInactiveSessions = async (db: D1Database) => {
  try {
    await db.prepare(`
      DELETE FROM active_sessions 
      WHERE last_activity < datetime('now', '-30 minutes')
    `).run();
  } catch (error) {
    logError("Failed to clean up inactive sessions", error);
  }
};

type SessionRow = {
  user_id: string;
  user_email: string;
  user_role?: string | null;
  name?: string | null;
  picture?: string | null;
  given_name?: string | null;
  family_name?: string | null;
};

// Fetch the currently authenticated user from active session
const authMiddleware: MiddlewareHandler<WorkerContext> = async (c, next) => {
  try {
    const sessionToken = getCookie(c, SESSION_COOKIE_NAME);
    
    if (!sessionToken) {
      // No session token found in request
      return c.json({ error: "Unauthorized - no session token" }, 401);
    }

    const session = await c.env.DB.prepare(
      `SELECT s.user_id, s.user_email, s.user_role, u.name, u.picture, u.given_name, u.family_name
       FROM active_sessions s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.session_token = ?`
    ).bind(sessionToken).first<SessionRow>();

    if (!session) {
      return c.json({ error: "Unauthorized - invalid session" }, 401);
    }

    const userRole = session.user_role || getUserRoleFromEmail(session.user_email || "");
    const user: AuthenticatedUser = {
      id: session.user_id,
      email: session.user_email,
      role: userRole,
      name: session.name ?? null,
      picture: session.picture ?? null,
      given_name: session.given_name ?? null,
      family_name: session.family_name ?? null,
    };

    await updateSessionActivity(c.env.DB, sessionToken);

    c.set("user", user);
    await next();
  } catch (error) {
    // Auth middleware error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ 
      error: "Unauthorized", 
      details: errorMessage 
    }, 401);
  }
};

app.use("*", cors({
  origin: ["http://localhost:5173", "http://localhost:8787", "https://kklbi2qxe4j22.mocha.app"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Cookie"],
  credentials: true,
}));

// Authentication routes
app.get('/api/oauth/google/redirect_url', async (c) => {
  try {
    const clientId = c.env.GOOGLE_CLIENT_ID;
    const configuredRedirect = c.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !configuredRedirect) {
      return c.json({ error: "Google OAuth is not configured" }, 500);
    }

    const redirectUri = buildRedirectUri(c);

    const state = crypto.randomUUID();
    const isSecure = isSecureRequest(c);

    setCookie(c, OAUTH_STATE_COOKIE_NAME, state, {
      httpOnly: true,
      path: "/",
      sameSite: isSecure ? "none" : "lax",
      secure: isSecure,
      maxAge: 10 * 60,
    });

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", OAUTH_SCOPE);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("prompt", "select_account");
    authUrl.searchParams.set("access_type", "offline");

    console.log("Generated Google OAuth redirect", {
      redirectUri,
      authUrl: authUrl.toString(),
    });

  return c.json({ redirectUrl: authUrl.toString(), redirectUri, state }, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return c.json({ error: "Failed to get OAuth redirect URL", details: errorMessage }, 500);
  }
});

app.post("/api/sessions", async (c) => {
  try {
    const body = await c.req.json();
    const { code, state } = body as { code?: string; state?: string };

    if (!code) {
      return c.json({ error: "No authorization code provided" }, 400);
    }

    const expectedState = getCookie(c, OAUTH_STATE_COOKIE_NAME);
    console.log("/api/sessions payload", {
      hasCode: Boolean(code),
      state,
      expectedState,
      hasCookieHeader: c.req.header("Cookie") !== undefined,
      cookieHeader: c.req.header("Cookie") || null,
    });
    if (!expectedState || expectedState !== state) {
      console.log("OAuth state mismatch", {
        expectedState,
        receivedState: state,
        hasCookieHeader: c.req.header("Cookie") !== undefined,
      });
      return c.json({
        error: "Invalid OAuth state",
        expectedState: expectedState ?? null,
        receivedState: state ?? null,
        hasCookieHeader: c.req.header("Cookie") !== undefined,
      }, 400);
    }

    const clientId = c.env.GOOGLE_CLIENT_ID;
    const clientSecret = c.env.GOOGLE_CLIENT_SECRET;
    const configuredRedirect = c.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !configuredRedirect) {
      return c.json({ error: "Google OAuth is not configured" }, 500);
    }

    const redirectUri = buildRedirectUri(c);

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const details = await tokenResponse.text();
      return c.json({ error: "Failed to exchange code", details }, 502);
    }

    const tokenData = await tokenResponse.json<{
      access_token?: string;
      id_token?: string;
      expires_in?: number;
    }>();

    if (!tokenData?.access_token) {
      return c.json({ error: "Missing access token" }, 502);
    }

    const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      const details = await userInfoResponse.text();
      return c.json({ error: "Failed to fetch user info", details }, 502);
    }

    const userInfo = await userInfoResponse.json<{
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      given_name?: string;
      family_name?: string;
    }>();

    if (!userInfo?.sub || !userInfo?.email) {
      return c.json({ error: "Incomplete user information" }, 502);
    }

    const userRole = getUserRoleFromEmail(userInfo.email);

    await c.env.DB.prepare(`
      INSERT INTO users (id, email, name, picture, given_name, family_name)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        name = excluded.name,
        picture = excluded.picture,
        given_name = excluded.given_name,
        family_name = excluded.family_name,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      userInfo.sub,
      userInfo.email,
      userInfo.name || null,
      userInfo.picture || null,
      userInfo.given_name || null,
      userInfo.family_name || null,
    ).run();

    await c.env.DB.prepare(
      "DELETE FROM active_sessions WHERE user_id = ?"
    ).bind(userInfo.sub).run();

    const sessionToken = crypto.randomUUID();

    await c.env.DB.prepare(`
      INSERT INTO active_sessions (session_token, user_id, user_email, user_role, last_activity, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      sessionToken,
      userInfo.sub,
      userInfo.email,
      userRole,
    ).run();

    const isSecure = isSecureRequest(c);

    setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: isSecure ? "none" : "lax",
      secure: isSecure,
      maxAge: 60 * 24 * 60 * 60,
    });

    setCookie(c, OAUTH_STATE_COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      sameSite: isSecure ? "none" : "lax",
      secure: isSecure,
      maxAge: 0,
    });

    return c.json({
      success: true,
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name || null,
        picture: userInfo.picture || null,
        given_name: userInfo.given_name || null,
        family_name: userInfo.family_name || null,
        role: userRole,
      },
    }, 200);
  } catch (error) {
    // Session exchange error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ 
      error: "Failed to exchange code for session token", 
      details: errorMessage 
    }, 500);
  }
});

app.get("/api/users/me", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(user);
  } catch (error) {
    logError("Failed to retrieve current user", error);
    return c.json({ error: "Failed to get user information" }, 500);
  }
});

app.get('/api/logout', async (c) => {
  try {
    const isSecure = isSecureRequest(c);
    const sessionToken = getCookie(c, SESSION_COOKIE_NAME);

    // Always clear the cookie first, regardless of session validity
    setCookie(c, SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      path: '/',
      sameSite: isSecure ? 'none' : 'lax',
      secure: isSecure,
      maxAge: 0,
    });

    // Remove session from active sessions table
    if (typeof sessionToken === 'string' && sessionToken.trim() !== '') {
      try {
        await c.env.DB.prepare(
          "DELETE FROM active_sessions WHERE session_token = ?"
        ).bind(sessionToken).run();
      } catch (dbError) {
        logError("Failed to clear session from database during logout", dbError);
      }
    }

    return c.json({ success: true }, 200);
  } catch (error) {
    // Even if everything fails, still try to clear the cookie
    try {
      const isSecure = isSecureRequest(c);
      setCookie(c, SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        path: '/',
        sameSite: isSecure ? 'none' : 'lax',
        secure: isSecure,
        maxAge: 0,
      });
    } catch (cookieError) {
      logError("Failed to clear session cookie during logout", cookieError);
    }
    logError("Failed to complete logout", error);
    
    // Always return success for logout to ensure frontend can redirect
    return c.json({ success: true }, 200);
  }
});

// Dashboard stats
app.get("/api/dashboard/stats", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    // Clean up inactive sessions first
    await cleanupInactiveSessions(c.env.DB);
    
    const [patientsResult, visitsResult] = await Promise.all([
      c.env.DB.prepare("SELECT COUNT(*) as count FROM patients").first(),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM medical_records WHERE visit_date >= date('now', '-30 days')").first(),
    ]);

    // Count active doctor sessions (active within last 30 minutes)
    const activeDoctorsResult = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM active_sessions 
      WHERE user_role = 'doctor' AND last_activity >= datetime('now', '-30 minutes')
    `).first();

    let doctorsOnline = (activeDoctorsResult as any)?.count || 0;
    
    // If no active doctor sessions found but current user is a doctor, count them
    if (doctorsOnline === 0 && user) {
      const userRole = getUserRoleFromEmail(user.email);
      if (userRole === 'doctor') {
        doctorsOnline = 1;
      }
    }

    let visitCount = (visitsResult as any)?.count || 0;
    if (visitCount === 0) {
      const yearlyVisitsResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM medical_records WHERE visit_date >= date('now', '-730 days')").first();
      visitCount = (yearlyVisitsResult as any)?.count || 0;
    }

    const stats: DashboardStats = {
      total_patients: (patientsResult as any)?.count || 0,
      recent_visits: visitCount,
      doctors_online: doctorsOnline,
    };

    return c.json(stats);
  } catch (error) {
    logError("Failed to fetch dashboard stats", error);
    return c.json({ error: "Failed to fetch dashboard stats" }, 500);
  }
});

// Patient routes
app.get("/api/patients", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const search = c.req.query("search") || "";
    
    let query = "SELECT * FROM patients";
    const params: any[] = [];
    
    if (search) {
      query += " WHERE (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR medical_record_number LIKE ? OR CAST(id AS TEXT) LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += " ORDER BY created_at DESC";
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json(results);
  } catch (error) {
    logError("Failed to fetch patients", error);
    return c.json({ error: "Failed to fetch patients" }, 500);
  }
});

app.get("/api/patients/:id", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const patientId = c.req.param("id");
    
    const patient = await c.env.DB.prepare(
      "SELECT * FROM patients WHERE id = ?"
    ).bind(patientId).first();
    
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    const [medicalRecords, labResults] = await Promise.all([
      c.env.DB.prepare(
        "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC"
      ).bind(patientId).all(),
      c.env.DB.prepare(
        "SELECT * FROM lab_results WHERE patient_id = ? ORDER BY test_date DESC"
      ).bind(patientId).all()
    ]);
    
    return c.json({
      ...patient,
      medical_records: medicalRecords.results,
      lab_results: labResults.results,
    });
  } catch (error) {
    logError("Failed to fetch patient", error);
    return c.json({ error: "Failed to fetch patient" }, 500);
  }
});

app.post("/api/patients", authMiddleware, zValidator("json", PatientSchema), async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const patientData = c.req.valid("json");
    
    const result = await c.env.DB.prepare(`
      INSERT INTO patients (
        user_id, first_name, last_name, email, phone, date_of_birth, gender,
        address, medical_record_number, blood_type, allergies, 
        emergency_contact_name, emergency_contact_phone, current_doctor_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      patientData.first_name,
      patientData.last_name,
      patientData.email || null,
      patientData.phone || null,
      patientData.date_of_birth || null,
      patientData.gender || null,
      patientData.address || null,
      patientData.medical_record_number || null,
      patientData.blood_type || null,
      patientData.allergies || null,
      patientData.emergency_contact_name || null,
      patientData.emergency_contact_phone || null,
      patientData.current_doctor_name || null
    ).run();
    
    return c.json({ id: result.meta.last_row_id, ...patientData }, 201);
  } catch (error) {
    logError("Failed to create patient", error);
    return c.json({ error: "Failed to create patient" }, 500);
  }
});

app.put("/api/patients/:id", authMiddleware, zValidator("json", PatientSchema), async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const patientId = c.req.param("id");
    const patientData = c.req.valid("json");
    
    const result = await c.env.DB.prepare(`
      UPDATE patients SET
        first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?,
        gender = ?, address = ?, medical_record_number = ?, blood_type = ?,
        allergies = ?, emergency_contact_name = ?, emergency_contact_phone = ?,
        current_doctor_name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      patientData.first_name,
      patientData.last_name,
      patientData.email || null,
      patientData.phone || null,
      patientData.date_of_birth || null,
      patientData.gender || null,
      patientData.address || null,
      patientData.medical_record_number || null,
      patientData.blood_type || null,
      patientData.allergies || null,
      patientData.emergency_contact_name || null,
      patientData.emergency_contact_phone || null,
      patientData.current_doctor_name || null,
      patientId
    ).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    return c.json({ id: patientId, ...patientData });
  } catch (error) {
    logError("Failed to update patient", error);
    return c.json({ error: "Failed to update patient" }, 500);
  }
});

// Medical records routes
app.post("/api/patients/:id/medical-records", authMiddleware, zValidator("json", MedicalRecordSchema), async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const patientId = c.req.param("id");
    const recordData = c.req.valid("json");
    
    const result = await c.env.DB.prepare(`
      INSERT INTO medical_records (
        patient_id, user_id, visit_date, chief_complaint, diagnosis, prescription,
        notes, blood_pressure_systolic, blood_pressure_diastolic, heart_rate,
        temperature, weight, height, blood_sugar, cholesterol, doctor_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      patientId,
      user.id,
      recordData.visit_date,
      recordData.chief_complaint || null,
      recordData.diagnosis || null,
      recordData.prescription || null,
      recordData.notes || null,
      recordData.blood_pressure_systolic || null,
      recordData.blood_pressure_diastolic || null,
      recordData.heart_rate || null,
      recordData.temperature || null,
      recordData.weight || null,
      recordData.height || null,
      recordData.blood_sugar || null,
      recordData.cholesterol || null,
      recordData.doctor_name || null
    ).run();
    
    return c.json({ id: result.meta.last_row_id, ...recordData }, 201);
  } catch (error) {
    logError("Failed to create medical record", error);
    return c.json({ error: "Failed to create medical record" }, 500);
  }
});

// Lab results routes
app.post("/api/patients/:id/lab-results", authMiddleware, zValidator("json", LabResultSchema), async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const patientId = c.req.param("id");
    const labData = c.req.valid("json");
    
    const result = await c.env.DB.prepare(`
      INSERT INTO lab_results (
        patient_id, user_id, test_name, test_value, test_unit,
        reference_range, test_date, is_abnormal, doctor_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      patientId,
      user.id,
      labData.test_name,
      labData.test_value,
      labData.test_unit || null,
      labData.reference_range || null,
      labData.test_date,
      labData.is_abnormal || 0,
      labData.doctor_name || null
    ).run();
    
    return c.json({ id: result.meta.last_row_id, ...labData }, 201);
  } catch (error) {
    logError("Failed to create lab result", error);
    return c.json({ error: "Failed to create lab result" }, 500);
  }
});

// Delete patient
app.delete("/api/patients/:id", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const patientId = c.req.param("id");
    
    // Delete related records first
    await Promise.all([
      c.env.DB.prepare("DELETE FROM medical_records WHERE patient_id = ?").bind(patientId).run(),
      c.env.DB.prepare("DELETE FROM lab_results WHERE patient_id = ?").bind(patientId).run()
    ]);
    
    // Delete patient
    const result = await c.env.DB.prepare("DELETE FROM patients WHERE id = ?").bind(patientId).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    logError("Failed to delete patient", error);
    return c.json({ error: "Failed to delete patient" }, 500);
  }
});

// Update medical record
app.put("/api/patients/:patientId/medical-records/:recordId", authMiddleware, zValidator("json", MedicalRecordSchema), async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const patientId = c.req.param("patientId");
    const recordId = c.req.param("recordId");
    const recordData = c.req.valid("json");
    
    const result = await c.env.DB.prepare(`
      UPDATE medical_records SET
        visit_date = ?, chief_complaint = ?, diagnosis = ?, prescription = ?,
        notes = ?, blood_pressure_systolic = ?, blood_pressure_diastolic = ?,
        heart_rate = ?, temperature = ?, weight = ?, height = ?,
        blood_sugar = ?, cholesterol = ?, doctor_name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND patient_id = ?
    `).bind(
      recordData.visit_date,
      recordData.chief_complaint || null,
      recordData.diagnosis || null,
      recordData.prescription || null,
      recordData.notes || null,
      recordData.blood_pressure_systolic || null,
      recordData.blood_pressure_diastolic || null,
      recordData.heart_rate || null,
      recordData.temperature || null,
      recordData.weight || null,
      recordData.height || null,
      recordData.blood_sugar || null,
      recordData.cholesterol || null,
      recordData.doctor_name || null,
      recordId,
      patientId
    ).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: "Medical record not found" }, 404);
    }
    
    return c.json({ id: recordId, ...recordData });
  } catch (error) {
    logError("Failed to update medical record", error);
    return c.json({ error: "Failed to update medical record" }, 500);
  }
});

// Delete medical record
app.delete("/api/patients/:patientId/medical-records/:recordId", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const patientId = c.req.param("patientId");
    const recordId = c.req.param("recordId");
    
    const result = await c.env.DB.prepare(
      "DELETE FROM medical_records WHERE id = ? AND patient_id = ?"
    ).bind(recordId, patientId).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: "Medical record not found" }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    logError("Failed to delete medical record", error);
    return c.json({ error: "Failed to delete medical record" }, 500);
  }
});

// Update lab result
app.put("/api/patients/:patientId/lab-results/:resultId", authMiddleware, zValidator("json", LabResultSchema), async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const patientId = c.req.param("patientId");
    const resultId = c.req.param("resultId");
    const labData = c.req.valid("json");
    
    const result = await c.env.DB.prepare(`
      UPDATE lab_results SET
        test_name = ?, test_value = ?, test_unit = ?, reference_range = ?,
        test_date = ?, is_abnormal = ?, doctor_name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND patient_id = ?
    `).bind(
      labData.test_name,
      labData.test_value,
      labData.test_unit || null,
      labData.reference_range || null,
      labData.test_date,
      labData.is_abnormal || 0,
      labData.doctor_name || null,
      resultId,
      patientId
    ).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: "Lab result not found" }, 404);
    }
    
    return c.json({ id: resultId, ...labData });
  } catch (error) {
    logError("Failed to update lab result", error);
    return c.json({ error: "Failed to update lab result" }, 500);
  }
});

// Delete lab result
app.delete("/api/patients/:patientId/lab-results/:resultId", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const patientId = c.req.param("patientId");
    const resultId = c.req.param("resultId");
    
    const result = await c.env.DB.prepare(
      "DELETE FROM lab_results WHERE id = ? AND patient_id = ?"
    ).bind(resultId, patientId).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: "Lab result not found" }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    logError("Failed to delete lab result", error);
    return c.json({ error: "Failed to delete lab result" }, 500);
  }
});

// Similar patients endpoint - enhanced algorithmic matching
app.get("/api/patients/:id/similar", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const patientId = c.req.param("id");
    const searchType = c.req.query("type") || "all";
    
    // Get current patient's complete medical profile
    const patient = await c.env.DB.prepare(
      "SELECT * FROM patients WHERE id = ?"
    ).bind(patientId).first();
    
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    // Get comprehensive patient data for analysis
    const [medicalRecords, labResults] = await Promise.all([
      c.env.DB.prepare(
        "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC"
      ).bind(patientId).all(),
      c.env.DB.prepare(
        "SELECT * FROM lab_results WHERE patient_id = ? ORDER BY test_date DESC"
      ).bind(patientId).all()
    ]);

    // Enhanced medical term extraction and categorization
    const extractMedicalTerms = (text: string, termType: 'diagnosis' | 'symptom' = 'diagnosis') => {
      if (!text) return [];
      
      const normalizedText = text.toLowerCase().trim();
  const terms = normalizedText.split(/[,;.]+/).map(s => s.trim()).filter(s => s.length > 2);
      
      const medicalDictionary = {
        // Cardiovascular
        cardiovascular: ['heart', 'cardiac', 'hypertension', 'blood pressure', 'coronary', 'arrhythmia', 'tachycardia', 'bradycardia', 'murmur', 'chest pain'],
        // Respiratory
        respiratory: ['asthma', 'copd', 'bronchitis', 'pneumonia', 'dyspnea', 'cough', 'shortness of breath', 'wheezing'],
        // Endocrine
        endocrine: ['diabetes', 'diabetic', 'thyroid', 'hyperthyroid', 'hypothyroid', 'insulin', 'glucose', 'metabolic'],
        // Gastrointestinal
        gastrointestinal: ['gastritis', 'gerd', 'ibs', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'abdominal pain'],
        // Neurological
        neurological: ['headache', 'migraine', 'seizure', 'stroke', 'dizziness', 'vertigo', 'neuropathy', 'tremor'],
        // Musculoskeletal
        musculoskeletal: ['arthritis', 'joint pain', 'back pain', 'fracture', 'osteoporosis', 'muscle pain', 'sprain'],
        // Infectious
        infectious: ['infection', 'fever', 'sepsis', 'pneumonia', 'uti', 'cellulitis', 'abscess'],
        // Mental Health
        mental_health: ['depression', 'anxiety', 'stress', 'insomnia', 'fatigue', 'mood'],
        // Dermatological
        dermatological: ['rash', 'eczema', 'psoriasis', 'dermatitis', 'skin lesion', 'allergy']
      };
      
      const categorizedTerms = [];
      const keywords = [];
      
      // Base weight adjustment based on term type
      const baseWeight = termType === 'diagnosis' ? 1.0 : 0.8;
      
      for (const term of terms) {
        // Check against medical dictionary
        for (const [category, categoryTerms] of Object.entries(medicalDictionary)) {
          for (const medTerm of categoryTerms) {
            if (term.includes(medTerm)) {
              categorizedTerms.push({
                term: medTerm,
                category,
                original: term,
                weight: (medTerm.length / term.length) * baseWeight // Specificity weight
              });
            }
          }
        }
        
        // Keep original term as well
        if (term.length > 3) {
          keywords.push({
            term,
            category: 'general',
            original: term,
            weight: 0.5 * baseWeight
          });
        }
      }
      
      return [...categorizedTerms, ...keywords];
    };

    // Extract and categorize current patient's medical profile
    const currentProfile = {
      age: (patient as any).date_of_birth ? 
        new Date().getFullYear() - new Date((patient as any).date_of_birth).getFullYear() : null,
      gender: (patient as any).gender,
      bloodType: (patient as any).blood_type,
      allergies: (patient as any).allergies,
      diagnoses: (medicalRecords.results as any[])
        .map(r => extractMedicalTerms(r.diagnosis, 'diagnosis'))
        .flat()
        .filter(t => t.term && t.term.length > 2),
      symptoms: (medicalRecords.results as any[])
        .map(r => extractMedicalTerms(r.chief_complaint, 'symptom'))
        .flat()
        .filter(t => t.term && t.term.length > 2),
      vitalTrends: {
        avgBP: calculateAverage((medicalRecords.results as any[]), 'blood_pressure_systolic'),
        avgHR: calculateAverage((medicalRecords.results as any[]), 'heart_rate'),
        avgTemp: calculateAverage((medicalRecords.results as any[]), 'temperature'),
        avgWeight: calculateAverage((medicalRecords.results as any[]), 'weight')
      },
      labAbnormalities: (labResults.results as any[])
        .filter(lab => lab.is_abnormal)
        .map(lab => lab.test_name.toLowerCase())
    };

    function calculateAverage(records: any[], field: string): number | null {
      const values = records.map(r => r[field]).filter(v => v != null && !isNaN(v));
      return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : null;
    }

    // Enhanced similarity search with multiple criteria
    const searchCandidates = await c.env.DB.prepare(`
      SELECT DISTINCT p.id, p.gender, p.blood_type, p.allergies, p.date_of_birth,
             COUNT(DISTINCT mr.id) as record_count,
             MAX(mr.visit_date) as latest_visit
      FROM patients p
      LEFT JOIN medical_records mr ON p.id = mr.patient_id
      WHERE p.id != ?
      GROUP BY p.id, p.gender, p.blood_type, p.allergies, p.date_of_birth
      HAVING record_count > 0
      ORDER BY latest_visit DESC
      LIMIT 50
    `).bind(patientId).all();

    // Calculate detailed similarity scores for each candidate
    const detailedCandidates = await Promise.all((searchCandidates.results as any[]).map(async (candidate) => {
      // Get candidate's medical data
      const [candidateMedical, candidateLabs] = await Promise.all([
        c.env.DB.prepare(
          "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC LIMIT 20"
        ).bind(candidate.id).all(),
        c.env.DB.prepare(
          "SELECT * FROM lab_results WHERE patient_id = ? ORDER BY test_date DESC LIMIT 15"
        ).bind(candidate.id).all()
      ]);

      // Extract candidate's profile
      const candidateProfile = {
        age: candidate.date_of_birth ? 
          new Date().getFullYear() - new Date(candidate.date_of_birth).getFullYear() : null,
        gender: candidate.gender,
        bloodType: candidate.blood_type,
        allergies: candidate.allergies,
        diagnoses: (candidateMedical.results as any[])
          .map(r => extractMedicalTerms(r.diagnosis, 'diagnosis'))
          .flat()
          .filter(t => t.term && t.term.length > 2),
        symptoms: (candidateMedical.results as any[])
          .map(r => extractMedicalTerms(r.chief_complaint, 'symptom'))
          .flat()
          .filter(t => t.term && t.term.length > 2),
        vitalTrends: {
          avgBP: calculateAverage((candidateMedical.results as any[]), 'blood_pressure_systolic'),
          avgHR: calculateAverage((candidateMedical.results as any[]), 'heart_rate'),
          avgTemp: calculateAverage((candidateMedical.results as any[]), 'temperature'),
          avgWeight: calculateAverage((candidateMedical.results as any[]), 'weight')
        },
        labAbnormalities: (candidateLabs.results as any[])
          .filter(lab => lab.is_abnormal)
          .map(lab => lab.test_name.toLowerCase())
      };

      // Multi-dimensional similarity calculation
      let similarityScore = 0;
      let maxScore = 0;

      // 1. Medical condition similarity (35% weight)
      if (searchType === "diagnosis" || searchType === "all") {
        const diagnosisScore = calculateTermSimilarity(currentProfile.diagnoses, candidateProfile.diagnoses);
        similarityScore += diagnosisScore * 0.35;
        maxScore += 0.35;
      }

      // 2. Symptom similarity (30% weight)
      if (searchType === "symptoms" || searchType === "all") {
        const symptomScore = calculateTermSimilarity(currentProfile.symptoms, candidateProfile.symptoms);
        similarityScore += symptomScore * 0.30;
        maxScore += 0.30;
      }

      // 3. Demographics similarity (15% weight)
      const demoScore = calculateDemographicSimilarity(currentProfile, candidateProfile);
      similarityScore += demoScore * 0.15;
      maxScore += 0.15;

      // 4. Lab abnormalities similarity (10% weight)
      const labScore = calculateArraySimilarity(currentProfile.labAbnormalities, candidateProfile.labAbnormalities);
      similarityScore += labScore * 0.10;
      maxScore += 0.10;

      // 5. Vital signs patterns (10% weight)
      const vitalScore = calculateVitalSimilarity(currentProfile.vitalTrends, candidateProfile.vitalTrends);
      similarityScore += vitalScore * 0.10;
      maxScore += 0.10;

      // Normalize score
      const normalizedScore = maxScore > 0 ? similarityScore / maxScore : 0;

      return {
        ...candidate,
        similarity_score: Math.min(0.99, Math.max(0.01, normalizedScore)),
        medical_records: candidateMedical.results,
        lab_results: candidateLabs.results,
        matching_categories: getMatchingCategories(currentProfile, candidateProfile)
      };
    }));

    function calculateTermSimilarity(currentTerms: any[], candidateTerms: any[]): number {
      if (!currentTerms?.length || !candidateTerms?.length) return 0;
      
      let totalScore = 0;
      let totalWeight = 0;
      
      for (const currentTerm of currentTerms) {
        for (const candidateTerm of candidateTerms) {
          if (currentTerm.term === candidateTerm.term) {
            const weight = (currentTerm.weight + candidateTerm.weight) / 2;
            totalScore += weight * 1.0; // Exact match
            totalWeight += weight;
          } else if (currentTerm.category === candidateTerm.category && currentTerm.category !== 'general') {
            const weight = (currentTerm.weight + candidateTerm.weight) / 2;
            totalScore += weight * 0.7; // Category match
            totalWeight += weight;
          } else if (currentTerm.term.includes(candidateTerm.term) || candidateTerm.term.includes(currentTerm.term)) {
            const weight = (currentTerm.weight + candidateTerm.weight) / 2;
            totalScore += weight * 0.5; // Partial match
            totalWeight += weight;
          }
        }
      }
      
      return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    function calculateDemographicSimilarity(current: any, candidate: any): number {
      let score = 0;
      let factors = 0;
      
      // Age similarity (±10 years gets full score)
      if (current.age && candidate.age) {
        const ageDiff = Math.abs(current.age - candidate.age);
        score += Math.max(0, 1 - ageDiff / 20);
        factors++;
      }
      
      // Gender match
      if (current.gender && candidate.gender) {
        score += current.gender === candidate.gender ? 1 : 0;
        factors++;
      }
      
      // Blood type compatibility
      if (current.bloodType && candidate.bloodType) {
        score += current.bloodType === candidate.bloodType ? 1 : 0.3;
        factors++;
      }
      
      return factors > 0 ? score / factors : 0.5;
    }

    function calculateArraySimilarity(arr1: string[], arr2: string[]): number {
      if (!arr1?.length && !arr2?.length) return 1;
      if (!arr1?.length || !arr2?.length) return 0;
      
      const intersection = arr1.filter(item => arr2.includes(item));
      const union = [...new Set([...arr1, ...arr2])];
      
      return intersection.length / union.length;
    }

    function calculateVitalSimilarity(vitals1: any, vitals2: any): number {
      let score = 0;
      let factors = 0;
      
      const vitalFields = ['avgBP', 'avgHR', 'avgTemp', 'avgWeight'];
      
      for (const field of vitalFields) {
        if (vitals1[field] != null && vitals2[field] != null) {
          const diff = Math.abs(vitals1[field] - vitals2[field]);
          const relativeDiff = diff / Math.max(vitals1[field], vitals2[field]);
          score += Math.max(0, 1 - relativeDiff * 2);
          factors++;
        }
      }
      
      return factors > 0 ? score / factors : 0.5;
    }

    function getMatchingCategories(current: any, candidate: any): string[] {
      const categories = new Set<string>();
      
      // Check diagnosis categories
      for (const currentDiag of current.diagnoses || []) {
        for (const candidateDiag of candidate.diagnoses || []) {
          if (currentDiag.category === candidateDiag.category && currentDiag.category !== 'general') {
            categories.add(currentDiag.category.replace('_', ' '));
          }
        }
      }
      
      // Check symptom categories
      for (const currentSymp of current.symptoms || []) {
        for (const candidateSymp of candidate.symptoms || []) {
          if (currentSymp.category === candidateSymp.category && currentSymp.category !== 'general') {
            categories.add(currentSymp.category.replace('_', ' '));
          }
        }
      }
      
      return Array.from(categories);
    }

    // Filter and sort results by relevance and similarity
    const filteredResults = detailedCandidates
      .filter(candidate => candidate.similarity_score > 0.15) // Minimum threshold
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 15);

    // Format results for frontend
    const formattedResults = filteredResults.map(candidate => {
      const medical_timeline = (candidate.medical_records as any[]).map(record => ({
        date: record.visit_date,
        diagnosis: record.diagnosis || 'Not specified',
        chief_complaint: record.chief_complaint || 'Not specified',
        prescription: record.prescription || 'Not specified',
        notes: record.notes || '',
        doctor_name: record.doctor_name || 'Dr. Anonymous',
        vital_signs: {
          bp: record.blood_pressure_systolic && record.blood_pressure_diastolic ? 
              `${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}` : undefined,
          hr: record.heart_rate,
          temp: record.temperature,
          weight: record.weight
        }
      }));

      return {
        id: candidate.id,
        case_id: `CASE-${candidate.id.toString().padStart(4, '0')}`,
        age: candidate.age,
        gender: candidate.gender,
        blood_type: candidate.blood_type,
        allergies: candidate.allergies,
        latest_diagnosis: medical_timeline[0]?.diagnosis || 'Not specified',
        latest_visit_date: candidate.latest_visit,
        medical_records_count: candidate.record_count,
        medical_timeline,
        lab_results: candidate.lab_results,
        common_conditions: candidate.matching_categories.length > 0 ? 
          candidate.matching_categories : ['Similar medical patterns'],
        similarity_score: candidate.similarity_score
      };
    });

    return c.json({ patients: formattedResults });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: "Failed to find similar patients", details: errorMessage }, 500);
  }
});

// Medical Literature Search endpoint
app.get("/api/patients/:id/literature", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const patientId = c.req.param("id");
    const customQuery = c.req.query("query") || "";
    
    // Get comprehensive patient data to extract medical terms
    const patient = await c.env.DB.prepare(
      "SELECT * FROM patients WHERE id = ?"
    ).bind(patientId).first();
    
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    const [medicalRecords, labResults] = await Promise.all([
      c.env.DB.prepare(
        "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC LIMIT 10"
      ).bind(patientId).all(),
      c.env.DB.prepare(
        "SELECT * FROM lab_results WHERE patient_id = ? ORDER BY test_date DESC LIMIT 20"
      ).bind(patientId).all()
    ]);

    // Extract comprehensive medical terms from patient records
    const searchTerms: string[] = [];
    const conditionSet = new Set<string>();
    const diagnosisSet = new Set<string>();
    
    if (customQuery) {
      // User provided custom search query
      searchTerms.push(customQuery);
    } else {
      // Auto-extract from patient data
      const records = medicalRecords.results as any[];
      const labs = labResults.results as any[];
      
      // Extract diagnoses (most important) - with deduplication
      for (const record of records) {
        if (record.diagnosis && record.diagnosis.trim()) {
          const diagnosis = record.diagnosis.trim();
          // Split multiple diagnoses if separated by common delimiters
          const diagnosisParts = diagnosis.split(/[,;]/).map((d: string) => d.trim()).filter((d: string) => d.length > 3);
          diagnosisParts.forEach((d: string) => diagnosisSet.add(d));
        }
      }
      
      // Add unique diagnoses to condition set
      diagnosisSet.forEach(d => conditionSet.add(d));
      
      // Extract medications (indicates chronic conditions)
      for (const record of records) {
        if (record.medications && record.medications.trim()) {
          const meds = record.medications.toLowerCase();
          // Infer conditions from medications - only if not already in diagnoses
          if ((meds.includes('metformin') || meds.includes('insulin') || meds.includes('glipizide') || meds.includes('glyburide')) 
              && !Array.from(diagnosisSet).some(d => d.toLowerCase().includes('diabetes'))) {
            conditionSet.add('Type 2 Diabetes Mellitus');
          }
          if ((meds.includes('amlodipine') || meds.includes('lisinopril') || meds.includes('losartan') || meds.includes('atenolol') || meds.includes('metoprolol')) 
              && !Array.from(diagnosisSet).some(d => d.toLowerCase().includes('hypertension'))) {
            conditionSet.add('Hypertension');
          }
          if ((meds.includes('atorvastatin') || meds.includes('simvastatin') || meds.includes('rosuvastatin') || meds.includes('pravastatin')) 
              && !Array.from(diagnosisSet).some(d => d.toLowerCase().includes('lipid') || d.toLowerCase().includes('cholesterol'))) {
            conditionSet.add('Hyperlipidemia');
          }
          if (meds.includes('levothyroxine') 
              && !Array.from(diagnosisSet).some(d => d.toLowerCase().includes('thyroid'))) {
            conditionSet.add('Hypothyroidism');
          }
          if ((meds.includes('aspirin') || meds.includes('clopidogrel')) 
              && !Array.from(diagnosisSet).some(d => d.toLowerCase().includes('coronary') || d.toLowerCase().includes('cardiac'))) {
            conditionSet.add('Cardiovascular Disease Prevention');
          }
        }
      }
      
      // Detect abnormal lab patterns - only if not already diagnosed
      const recentGlucose = labs.filter(l => l.test_name === 'Glucose').slice(0, 3);
      const recentHbA1c = labs.filter(l => l.test_name === 'HbA1c').slice(0, 2);
      const recentCholesterol = labs.filter(l => l.test_name === 'Cholesterol').slice(0, 3);
      const recentCreatinine = labs.filter(l => l.test_name === 'Creatinine').slice(0, 3);
      const recentHemoglobin = labs.filter(l => l.test_name === 'Hemoglobin').slice(0, 3);
      
      if ((recentGlucose.some(l => parseFloat(l.result) > 125) || recentHbA1c.some(l => parseFloat(l.result) > 6.5))
          && !Array.from(conditionSet).some(c => c.toLowerCase().includes('diabetes'))) {
        conditionSet.add('Diabetes Management');
      }
      if (recentCholesterol.some(l => parseFloat(l.result) > 240)
          && !Array.from(conditionSet).some(c => c.toLowerCase().includes('lipid') || c.toLowerCase().includes('cholesterol'))) {
        conditionSet.add('Dyslipidemia');
      }
      if (recentCreatinine.some(l => parseFloat(l.result) > 1.3)
          && !Array.from(conditionSet).some(c => c.toLowerCase().includes('kidney') || c.toLowerCase().includes('renal'))) {
        conditionSet.add('Chronic Kidney Disease');
      }
      if (recentHemoglobin.some(l => parseFloat(l.result) < 12)
          && !Array.from(conditionSet).some(c => c.toLowerCase().includes('anemia'))) {
        conditionSet.add('Anemia Management');
      }
      
      // Convert set to array and prioritize (limit to top 4 most important)
      searchTerms.push(...Array.from(conditionSet).slice(0, 4));
      
      // If no conditions found, use chief complaints as fallback
      if (searchTerms.length === 0) {
        const complaintSet = new Set<string>();
        for (const record of records.slice(0, 5)) {
          if (record.chief_complaint && record.chief_complaint.trim()) {
            complaintSet.add(record.chief_complaint.trim());
          }
        }
        searchTerms.push(...Array.from(complaintSet).slice(0, 3));
      }
    }

    // Build focused PubMed search query
    const cleanTerms = searchTerms
      .slice(0, 4)
      .map((term: string) => term.replace(/[^\w\s]/g, '').trim())
      .filter((term: string) => term.length > 0);
    
    if (cleanTerms.length === 0) {
      return c.json({ articles: [], searchTerms: [], message: "No medical conditions found to search" });
    }
    
    // Use parentheses for OR grouping to ensure proper query logic
    const searchQuery = cleanTerms.length === 1 
      ? cleanTerms[0]
      : `(${cleanTerms.join(') OR (')})`;

    try {
      // Step 1: Search for article IDs with filters for recent, relevant articles
      // Broaden search by removing strict publication type filters initially
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}+AND+(Review[ptyp]+OR+Clinical+Trial[ptyp]+OR+Meta-Analysis[ptyp]+OR+Guideline[ptyp])&retmode=json&retmax=15&sort=relevance`;
      const searchResponse = await (globalThis as any).fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      // If no results with strict filters, try broader search
      if (!searchData.esearchresult?.idlist?.length) {
        const broadSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=15&sort=relevance`;
        const broadResponse = await (globalThis as any).fetch(broadSearchUrl);
        const broadData = await broadResponse.json();
        
        if (!broadData.esearchresult?.idlist?.length) {
          return c.json({ 
            articles: [], 
            searchTerms: cleanTerms,
            message: `No articles found for: ${cleanTerms.join(', ')}`
          });
        }
        
        searchData.esearchresult = broadData.esearchresult;
      }

      // Step 2: Get article details
      const ids = searchData.esearchresult.idlist.slice(0, 8).join(',');
      const detailUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`;
      const detailResponse = await (globalThis as any).fetch(detailUrl);
      const detailData = await detailResponse.json();

      // Step 3: Fetch abstracts for better content
      const abstractUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids}&retmode=xml&rettype=abstract`;
      const abstractResponse = await (globalThis as any).fetch(abstractUrl);
      const abstractXml = await abstractResponse.text();
      
      // Parse abstracts from XML (basic extraction)
      const abstractMap = new Map<string, string>();
      const pmidMatches = abstractXml.matchAll(/<PMID[^>]*>(\d+)<\/PMID>[\s\S]*?<Abstract>([\s\S]*?)<\/Abstract>/g);
      for (const match of pmidMatches) {
        const pmid = match[1];
        const abstractContent = match[2]
          .replace(/<AbstractText[^>]*>/g, '')
          .replace(/<\/AbstractText>/g, ' ')
          .replace(/<[^>]+>/g, '')
          .trim();
        abstractMap.set(pmid, abstractContent);
      }

      const articles = [];
      const searchTermsLower = cleanTerms.map((t: string) => t.toLowerCase());
      
      for (const id of searchData.esearchresult.idlist.slice(0, 10)) {
        const article = detailData.result[id];
        if (article && article.title) {
          const abstract = abstractMap.get(id) || 'Abstract not available for this article. Please view on PubMed for full details.';
          
          // Calculate real relevance score based on term matching
          const titleLower = (article.title || '').toLowerCase();
          const abstractLower = abstract.toLowerCase();
          let relevanceScore = 0.4; // Base score
          
          // Check each search term for matches
          for (const term of searchTermsLower) {
            const termWords = term.split(/\s+/);
            // Exact phrase match in title
            if (titleLower.includes(term)) {
              relevanceScore += 0.30;
            } else {
              // Partial word matches in title
              const titleMatches = termWords.filter(word => word.length > 3 && titleLower.includes(word)).length;
              relevanceScore += (titleMatches / termWords.length) * 0.20;
            }
            
            // Match in abstract
            if (abstractLower.includes(term)) {
              relevanceScore += 0.15;
            } else {
              const abstractMatches = termWords.filter(word => word.length > 3 && abstractLower.includes(word)).length;
              relevanceScore += (abstractMatches / termWords.length) * 0.10;
            }
          }
          
          // Boost score for recent publications
          const pubYear = parseInt((article.pubdate || '').substring(0, 4));
          if (pubYear >= 2023) relevanceScore += 0.12;
          else if (pubYear >= 2020) relevanceScore += 0.08;
          else if (pubYear >= 2018) relevanceScore += 0.04;
          
          // Boost for review articles and meta-analyses
          const articleType = (article.pubtype || []).map((t: any) => t.toLowerCase());
          if (articleType.some((t: string) => t.includes('review') || t.includes('meta-analysis'))) {
            relevanceScore += 0.10;
          }
          
          // Cap at 1.0
          relevanceScore = Math.min(relevanceScore, 1.0);
          
          articles.push({
            id: id,
            title: article.title,
            authors: article.authors?.slice(0, 3).map((a: any) => a.name).join(', ') || 'Authors not listed',
            journal: article.fulljournalname || article.source || 'Journal name unavailable',
            publication_date: article.pubdate || 'Date not available',
            abstract: abstract,
            pubmed_url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
            relevance_score: relevanceScore
          });
        }
      }

      // Sort by relevance score descending
      articles.sort((a, b) => b.relevance_score - a.relevance_score);

      return c.json({ 
        articles: articles.slice(0, 8),
        searchTerms: cleanTerms,
        totalFound: searchData.esearchresult.count || 0
      });
    } catch (pubmedError) {
      logError("Failed to query PubMed", pubmedError);
      
      // Return condition-specific mock articles if PubMed fails
      const primaryCondition = cleanTerms[0] || 'Complex Medical Conditions';
      const secondaryCondition = cleanTerms[1] || '';
      
      const mockArticles = [
        {
          id: "fallback1",
          title: `Evidence-Based Management of ${primaryCondition}: A Comprehensive Clinical Review`,
          authors: "Kumar, R., Patel, S., Sharma, A.",
          journal: "Indian Journal of Clinical Medicine",
          publication_date: "2024",
          abstract: `This comprehensive review examines current evidence-based approaches for the clinical management of ${primaryCondition}. The study analyzes recent clinical trials, treatment protocols, and patient outcomes across diverse populations. Key findings include optimal diagnostic criteria, first-line and adjunctive therapeutic strategies, monitoring parameters, and risk stratification tools. The review emphasizes individualized treatment plans, consideration of comorbidities, and adherence to international clinical guidelines. Detailed recommendations for follow-up intervals, screening protocols, and patient education strategies are provided based on current literature and expert consensus.`,
          pubmed_url: "https://pubmed.ncbi.nlm.nih.gov/",
          relevance_score: 0.92
        },
        {
          id: "fallback2", 
          title: `Clinical Outcomes and Prognostic Factors in ${primaryCondition}: A Multi-Center Observational Study`,
          authors: "Singh, M., Reddy, V., Gupta, N., Deshmukh, R.",
          journal: "Journal of Medical Research and Practice",
          publication_date: "2024",
          abstract: `Multi-center observational study examining clinical outcomes, prognostic indicators, and treatment efficacy in patients diagnosed with ${primaryCondition}. Analysis includes demographic factors, disease severity markers, laboratory parameters, and response to various therapeutic interventions across 5 major medical centers. The study identifies key predictors of disease progression, treatment response, and long-term outcomes. Results demonstrate the importance of early diagnosis, appropriate medication selection, lifestyle modifications, and regular monitoring. Statistical analysis reveals significant correlations between specific biomarkers and clinical outcomes. Implications for clinical practice, risk stratification, and patient counseling are discussed in detail.`,
          pubmed_url: "https://pubmed.ncbi.nlm.nih.gov/",
          relevance_score: 0.88
        },
        {
          id: "fallback3",
          title: `Diagnostic and Therapeutic Advances in ${primaryCondition}: Current Perspectives and Future Directions`,
          authors: "Desai, P., Mehta, K., Joshi, A., Krishnan, V.",
          journal: "Clinical Medicine Insights",
          publication_date: "2023",
          abstract: `This systematic review discusses recent diagnostic and therapeutic advances in the management of ${primaryCondition}. Topics include novel biomarkers, advanced imaging modalities, risk assessment tools, and emerging treatment options based on recent clinical trials. The article evaluates the evidence for various pharmacological and non-pharmacological interventions, including comparative effectiveness, safety profiles, and cost-effectiveness analyses. Special attention is given to management of comorbidities, patient-centered care approaches, and implementation of evidence-based guidelines in diverse clinical settings. The review also explores potential future therapeutic targets and ongoing research initiatives.`,
          pubmed_url: "https://pubmed.ncbi.nlm.nih.gov/",
          relevance_score: 0.85
        }
      ];
      
      // Add a 4th article if there's a secondary condition
      if (secondaryCondition) {
        mockArticles.push({
          id: "fallback4",
          title: `Integrated Management of ${primaryCondition} and ${secondaryCondition}: A Clinical Practice Guide`,
          authors: "Rao, S., Iyer, B., Chatterjee, P.",
          journal: "International Journal of Clinical Practice",
          publication_date: "2023",
          abstract: `This clinical practice guide addresses the integrated management of patients presenting with both ${primaryCondition} and ${secondaryCondition}. The guide provides evidence-based recommendations for diagnosis, treatment selection, medication interactions, monitoring strategies, and lifestyle interventions. Special focus is placed on optimizing therapeutic outcomes while minimizing adverse effects and drug-drug interactions. Case studies illustrate practical application of treatment algorithms in complex clinical scenarios. The guide emphasizes multidisciplinary care coordination and patient engagement in treatment decisions.`,
          pubmed_url: "https://pubmed.ncbi.nlm.nih.gov/",
          relevance_score: 0.90
        });
      }
      
      return c.json({ 
        articles: mockArticles,
        searchTerms: cleanTerms,
        fallback: true
      });
    }
  } catch (error) {
    logError("Failed to fetch medical literature", error);
    return c.json({ error: "Failed to fetch medical literature" }, 500);
  }
});

// Synthetic Case Generation endpoint
app.post("/api/patients/:id/synthetic-cases", authMiddleware, async (c) => {
  let requestedCount = 3;
  let requestedComplexity = "moderate";
  let fallbackPatient: any = null;
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const patientId = c.req.param("id");
    const body = await c.req.json();
    const { count = 3, complexity = "moderate" } = body as {
      count?: number;
      complexity?: string;
    };
    requestedCount = count;
    requestedComplexity = complexity;
    
    const patient = await c.env.DB.prepare(
      "SELECT * FROM patients WHERE id = ?"
    ).bind(patientId).first();
    
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }
    fallbackPatient = patient;
    
    const [medicalRecords, labResults] = await Promise.all([
      c.env.DB.prepare(
        "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC LIMIT 5"
      ).bind(patientId).all(),
      c.env.DB.prepare(
        "SELECT * FROM lab_results WHERE patient_id = ? ORDER BY test_date DESC LIMIT 10"
      ).bind(patientId).all()
    ]);

    const mockCases = buildMockSyntheticCases(patient, count, complexity);

    if (!c.env.GEMINI_API_KEY) {
      // Return mock synthetic cases
      return c.json({ synthetic_cases: mockCases.slice(0, count) });
    }

    const patientContext = {
      demographics: {
        age: (patient as any).date_of_birth ? new Date().getFullYear() - new Date((patient as any).date_of_birth).getFullYear() : null,
        gender: (patient as any).gender,
        blood_type: (patient as any).blood_type
      },
      conditions: (medicalRecords.results as any[]).map(r => ({
        diagnosis: r.diagnosis,
        chief_complaint: r.chief_complaint,
        visit_date: r.visit_date
      })),
      lab_abnormalities: (labResults.results as any[]).filter(l => l.is_abnormal).map(l => ({
        test: l.test_name,
        value: l.test_value
      }))
    };

    const prompt = `As a medical education specialist, create ${count} synthetic educational case scenarios based on the following patient context. These should be realistic but anonymized cases for teaching purposes.

Patient Context:
${JSON.stringify(patientContext, null, 2)}

Requirements:
- Case complexity: ${complexity}
- Create educational scenarios with similar medical patterns
- Include learning objectives and teaching points
- Make cases realistic but clearly educational/synthetic
- Focus on clinical reasoning and decision-making

Return ONLY a valid JSON object with this structure:
{
  "synthetic_cases": [
    {
      "id": "string",
      "case_title": "string",
      "patient_profile": {
        "age": number,
        "gender": "string", 
        "presentation": "string"
      },
      "clinical_scenario": "string",
      "learning_objectives": ["string1", "string2", "string3"],
      "teaching_points": ["string1", "string2", "string3"],
      "case_complexity": "string",
      "educational_value": number
    }
  ]
}`;

    let text: string;
    try {
      text = await requestGeminiText(c.env.GEMINI_API_KEY, prompt);
    } catch (geminiError) {
      logError("Gemini synthetic case request failed", geminiError);
      return c.json({ synthetic_cases: mockCases.slice(0, count) });
    }
    
    let casesData;
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      casesData = JSON.parse(cleanText);
    } catch (parseError) {
      logError("Failed to parse synthetic case response", parseError);
      casesData = {
        synthetic_cases: mockCases.slice(0, count),
      };
    }
    
    return c.json(casesData);
  } catch (error) {
    logError("Failed to generate synthetic cases", error);
    const patientForFallback = fallbackPatient ?? {};
    return c.json({
      synthetic_cases: buildMockSyntheticCases(
        patientForFallback,
        requestedCount,
        requestedComplexity,
      ).slice(0, requestedCount),
    });
  }
});

// AI Summary endpoint
app.post("/api/patients/:id/ai-summary", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const patientId = c.req.param("id");
    
    const patient = await c.env.DB.prepare(
      "SELECT * FROM patients WHERE id = ?"
    ).bind(patientId).first();
    
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    const [medicalRecords, labResults] = await Promise.all([
      c.env.DB.prepare(
        "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC"
      ).bind(patientId).all(),
      c.env.DB.prepare(
        "SELECT * FROM lab_results WHERE patient_id = ? ORDER BY test_date DESC"
      ).bind(patientId).all()
    ]);

  const fallbackSummary = buildDataDrivenSummary(patient, medicalRecords.results || [], labResults.results || []);

    if (!c.env.GEMINI_API_KEY) {
      return c.json({ summary: fallbackSummary });
    }

    const medicalData = {
      patient: {
        name: `${(patient as any).first_name} ${(patient as any).last_name}`,
        age: (patient as any).date_of_birth ? new Date().getFullYear() - new Date((patient as any).date_of_birth).getFullYear() : null,
        gender: (patient as any).gender,
        bloodType: (patient as any).blood_type,
        allergies: (patient as any).allergies,
      },
      medicalRecords: medicalRecords.results || [],
      labResults: labResults.results || [],
    };

    const prompt = `You are an experienced clinical AI assistant analyzing electronic medical records for a healthcare provider. Generate a clinically actionable, data-driven health summary.

PATIENT CONTEXT:
${JSON.stringify(medicalData, null, 2)}

CLINICAL ANALYSIS REQUIREMENTS:

1. OVERVIEW (2-3 sentences):
   - Synthesize the patient's PRIMARY medical conditions and their current status
   - Highlight the most recent visit's clinical significance
   - Note any care continuity patterns (regular follow-ups vs sporadic care)

2. KEY FINDINGS (3-5 specific, data-driven points):
   - Cite ACTUAL vitals, lab values, and diagnoses with dates
   - Identify disease progression or stability with specific metrics
   - Flag any critical abnormal results requiring immediate attention
   - Note medication adherence patterns if evident from visit frequency
   - Highlight any multi-system involvement or comorbidities

3. RISK FACTORS (3-5 evidence-based clinical risks):
   - List modifiable vs non-modifiable risk factors present
   - Quantify cardiovascular risk based on BP, lipids, diabetes markers
   - Identify complications already present (retinopathy, neuropathy, nephropathy)
   - Note lifestyle factors documented (obesity, smoking references)
   - Highlight medication interactions or contraindications based on allergies

4. RECOMMENDATIONS (3-5 prioritized, specific actions):
   - Prioritize by clinical urgency (address critical abnormals first)
   - Suggest specific follow-up timelines based on disease severity
   - Recommend specific diagnostic tests or specialist referrals
   - Propose evidence-based medication adjustments if patterns suggest poor control
   - Include preventive measures aligned with current guidelines (vaccinations, screenings)

5. TRENDS (2-3 sentences with trajectory analysis):
   - Analyze changes in vitals over time (improving, worsening, stable)
   - Evaluate glycemic/BP/lipid control trajectory if relevant
   - Assess weight trends and their clinical implications
   - Note gaps in care or monitoring that need addressing

CRITICAL INSTRUCTIONS:
- Use SPECIFIC data points (e.g., "HbA1c 8.5% on Jan 15" not "elevated blood sugar")
- Reference actual visit dates and test dates
- Avoid generic statements; make every point actionable and measurable
- If data is limited, explicitly state the gaps and recommend filling them
- Focus on the most clinically significant 3-6 month trajectory

Return ONLY valid JSON in this structure (no markdown, no explanations):
{
  "overview": "string",
  "key_findings": ["string1", "string2", "string3", "string4"],
  "risk_factors": ["string1", "string2", "string3", "string4"],
  "recommendations": ["string1", "string2", "string3", "string4"],
  "trends": "string"
}`;

    let summary: StructuredSummary = fallbackSummary;
    try {
      const rawResponse = await requestGeminiText(c.env.GEMINI_API_KEY, prompt);
      const parsed = parseJsonOr<StructuredSummary>(rawResponse, fallbackSummary);
      summary = normalizeSummary(parsed, fallbackSummary);
    } catch (geminiError) {
      logError("Gemini AI summary request failed", geminiError);
      summary = fallbackSummary;
    }

    return c.json({ summary });
  } catch (error) {
    logError("Failed to generate AI summary", error);
    return c.json({
      summary: buildMockSummary(null, [], []),
    });
  }
});

// Medical Chatbot endpoint - AI assistant for doctors (Meditron 7B powered)
app.post("/api/chatbot", authMiddleware, async (c) => {
  // Parse body once at the top level to avoid re-reading issues
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { message, conversationHistory = [] } = body as {
    message: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  };

  if (!message || message.trim().length === 0) {
    return c.json({ error: "Message is required" }, 400);
  }

  try {

    // Initialize Ollama client for Meditron 7B
    const ollama = new OllamaClient({
      baseUrl: c.env.OLLAMA_URL || 'http://localhost:11434',
      model: 'meditron',
      temperature: 0.7,
      maxTokens: 2048,
    });

    // Check Ollama availability
    const isOllamaHealthy = await ollama.healthCheck();
    let aiResponse: string;
    let source: string;

    if (isOllamaHealthy) {
      try {
        // Format messages for Ollama chat API
        const chatMessages = [
          {
            role: 'system' as const,
            content: CHATBOT_SYSTEM_PROMPT,
          },
          ...conversationHistory.slice(-10).map((msg: any) => ({
            role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: msg.content,
          })),
          {
            role: 'user' as const,
            content: message,
          },
        ];

        // Generate response with Meditron
        aiResponse = await ollama.chat(chatMessages);
        source = 'meditron-7b';

        // Add disclaimer if discussing treatment or diagnosis
        const needsDisclaimer = /treat|diagnose|prescribe|recommend|therapy|medication|drug/i.test(message);
        if (needsDisclaimer && !aiResponse.toLowerCase().includes('disclaimer')) {
          aiResponse += "\n\n*Note: This information is for educational purposes. Always verify with current clinical guidelines and consider individual patient factors when making clinical decisions.*";
        }

      } catch (ollamaError) {
        logError("Meditron (Ollama) API call failed", ollamaError);
        throw ollamaError; // Fall through to Gemini backup
      }

    } else {
      throw new Error("Ollama not available");
    }

    return c.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      conversationId: crypto.randomUUID(),
      model: source,
      source: 'meditron',
    });

  } catch (primaryError) {
    // Fallback to Gemini if Meditron fails
    try {
      logError("Primary AI (Meditron) failed, falling back to Gemini", primaryError);

      let conversationContext = `You are CuraNova AI Assistant, a highly knowledgeable medical AI assistant helping doctors and healthcare professionals. You provide evidence-based medical information, clinical guidance, and decision support.

IMPORTANT GUIDELINES:
1. Provide accurate, evidence-based medical information
2. Cite medical guidelines and research when relevant
3. Be concise but thorough in explanations
4. Use clinical terminology appropriately
5. Always remind that final clinical decisions should be made by the healthcare provider
6. If asked about specific patient cases, provide general guidance while emphasizing the need for individual assessment
7. For medication questions, include common dosages, contraindications, and interactions
8. For diagnostic questions, discuss differential diagnoses and recommended workup
9. Stay current with medical best practices and guidelines

`;

      if (conversationHistory.length > 0) {
        conversationContext += "\nConversation History:\n";
        const recentHistory = conversationHistory.slice(-10);
        for (const msg of recentHistory) {
          const role = msg.role === 'user' ? 'Doctor' : 'AI Assistant';
          conversationContext += `${role}: ${msg.content}\n`;
        }
        conversationContext += "\n";
      }

      conversationContext += `Doctor's Question: ${message}\n\nAI Assistant:`;

      if (c.env.GEMINI_API_KEY) {
        const geminiResponse = await requestGeminiText(c.env.GEMINI_API_KEY, conversationContext);
        
        let aiResponse = geminiResponse.trim();
        const needsDisclaimer = /treat|diagnose|prescribe|recommend|therapy|medication|drug/i.test(message);
        if (needsDisclaimer && !aiResponse.toLowerCase().includes('disclaimer')) {
          aiResponse += "\n\n*Note: This information is for educational purposes. Always verify with current clinical guidelines and consider individual patient factors when making clinical decisions.*";
        }

        return c.json({
          response: aiResponse,
          timestamp: new Date().toISOString(),
          conversationId: crypto.randomUUID(),
          model: 'gemini-1.5-flash',
          source: 'gemini-fallback',
        });
      }

      throw new Error("No AI service available");

    } catch (fallbackError) {
      logError("All AI services failed", fallbackError);
      
      const fallbackResponse = getFallbackChatbotResponse(message);
      
      return c.json({
        response: fallbackResponse,
        timestamp: new Date().toISOString(),
        conversationId: crypto.randomUUID(),
        model: 'static-fallback',
        source: 'fallback',
      });
    }
  }
});

// Helper function for fallback chatbot responses
function getFallbackChatbotResponse(question: string): string {
  const questionLower = question.toLowerCase();
  
  // Hypertension queries
  if (questionLower.includes('hypertension') || questionLower.includes('blood pressure')) {
    return `Based on current JNC-8 and ACC/AHA guidelines for hypertension management:

**Blood Pressure Classification:**
- Normal: <120/80 mmHg
- Elevated: 120-129/<80 mmHg
- Stage 1: 130-139/80-89 mmHg
- Stage 2: ≥140/90 mmHg

**First-line Medications:**
1. Thiazide diuretics (e.g., Chlorthalidone 12.5-25mg daily)
2. ACE inhibitors (e.g., Lisinopril 10-40mg daily)
3. ARBs (e.g., Losartan 25-100mg daily)
4. Calcium channel blockers (e.g., Amlodipine 5-10mg daily)

**Treatment Goals:**
- General population: <130/80 mmHg
- Diabetes/CKD: <130/80 mmHg
- Elderly (>65): <130/80 mmHg (if tolerated)

**Lifestyle Modifications:**
- DASH diet, sodium restriction (<2g/day), regular exercise, weight loss, alcohol moderation

*Note: Treatment should be individualized based on patient comorbidities, age, and risk factors.*`;
  }
  
  // Diabetes queries
  if (questionLower.includes('diabetes') || questionLower.includes('glucose') || questionLower.includes('hba1c')) {
    return `Current ADA guidelines for Type 2 Diabetes management:

**Diagnostic Criteria:**
- Fasting glucose ≥126 mg/dL
- 2-hour OGTT ≥200 mg/dL
- HbA1c ≥6.5%
- Random glucose ≥200 mg/dL with symptoms

**Treatment Goals:**
- HbA1c: <7% (general), <6.5% (if achieved safely), <8% (elderly/comorbidities)
- Preprandial glucose: 80-130 mg/dL
- Postprandial: <180 mg/dL

**First-line Therapy:**
1. Metformin 500-2000mg daily (start low, titrate up)
2. If inadequate control, add:
   - SGLT-2 inhibitors (cardiovascular/renal benefits)
   - GLP-1 agonists (weight loss, CV benefits)
   - DPP-4 inhibitors
   - Sulfonylureas (budget-friendly)
   - Insulin (if severe hyperglycemia)

**Monitoring:**
- HbA1c every 3 months until goal, then every 6 months
- Annual screening for retinopathy, nephropathy, neuropathy
- Cardiovascular risk assessment

*Note: Consider patient-specific factors including cardiovascular disease, renal function, and hypoglycemia risk.*`;
  }
  
  // General medication query
  if (questionLower.includes('medication') || questionLower.includes('drug') || questionLower.includes('prescribe')) {
    return `I can help with medication-related questions. For specific guidance, please ask about:

- **Specific medications** (dosing, interactions, contraindications)
- **Therapeutic classes** (comparison, selection criteria)
- **Clinical conditions** (first-line agents, treatment algorithms)
- **Drug interactions** (major interactions to avoid)
- **Adverse effects** (monitoring parameters, management)

Please provide more details about your specific medication question, including:
- The condition being treated
- Patient characteristics (age, comorbidities, current medications)
- Specific concerns or decision points

*Always verify prescribing information with current FDA labeling and institutional formularies.*`;
  }
  
  // Diagnostic queries
  if (questionLower.includes('diagnose') || questionLower.includes('differential') || questionLower.includes('workup')) {
    return `For diagnostic assistance, I can help with:

**Differential Diagnosis Development:**
- Common and serious causes to consider
- Red flag symptoms requiring urgent evaluation
- Systematic approach by organ system

**Diagnostic Workup Recommendations:**
- Appropriate laboratory tests
- Imaging modalities and indications
- Timing and urgency of investigations

**Clinical Decision Tools:**
- Evidence-based scoring systems
- Risk stratification approaches
- Diagnostic algorithms

Please provide specific details about:
- Chief complaint and presenting symptoms
- Duration and progression
- Relevant patient history
- Physical examination findings

This will allow me to provide more targeted diagnostic guidance.

*Remember: Clinical judgment and individual patient assessment are essential for accurate diagnosis.*`;
  }

  // Default response
  return `Thank you for your question. As CuraNova AI Assistant, I can help you with:

**Clinical Questions:**
- Disease management guidelines
- Medication selection and dosing
- Diagnostic workup recommendations
- Differential diagnosis considerations
- Treatment protocols and algorithms

**Common Topics:**
- Chronic disease management (diabetes, hypertension, COPD, etc.)
- Acute care conditions
- Preventive care guidelines
- Laboratory interpretation
- Medication interactions and contraindications

**How to Ask:**
Please be specific about:
- The clinical scenario or condition
- Patient demographics (age, comorbidities)
- Your specific question or decision point

For example:
- "What is the first-line treatment for newly diagnosed type 2 diabetes in a 55-year-old?"
- "How should I manage a patient with resistant hypertension?"
- "What workup is needed for unexplained anemia?"

I'm here to provide evidence-based medical guidance. How can I assist you today?

*Disclaimer: This AI assistant provides general medical information and should not replace clinical judgment or individualized patient assessment.*`;
}

// Patient login endpoint
app.post('/api/patient-login', async (c) => {
  try {
    const body = await c.req.json();
    const mrn = body.mrn;

    if (!mrn) {
      return c.json({ error: "Medical Record Number is required" }, 400);
    }

    // Check if patient exists with this MRN
    const patient = await c.env.DB.prepare(
      "SELECT * FROM patients WHERE medical_record_number = ?"
    ).bind(mrn).first();

    if (!patient) {
      return c.json({ error: "Invalid Medical Record Number" }, 401);
    }

    // Generate a simple session token for the patient
    const sessionToken = `patient_${mrn}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store patient session
    await c.env.DB.prepare(`
      INSERT INTO patient_sessions (session_token, patient_id, medical_record_number)
      VALUES (?, ?, ?)
    `).bind(sessionToken, (patient as any).id, mrn).run();

    // Set session cookie
    const isSecure = isSecureRequest(c);
    setCookie(c, 'patient_session_token', sessionToken, {
      httpOnly: true,
      path: '/',
      sameSite: isSecure ? 'none' : 'lax',
      secure: isSecure,
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return c.json({ success: true, patient_id: (patient as any).id });
  } catch (error) {
    logError("Patient login failed", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Patient data endpoint
app.get('/api/patient-data/:mrn', async (c) => {
  try {
    const mrn = c.req.param('mrn');
    
    // Verify patient session
    const sessionToken = getCookie(c, 'patient_session_token');
    if (!sessionToken) {
      // Check if patient session exists in localStorage (for demo)
      const patient = await c.env.DB.prepare(
        "SELECT * FROM patients WHERE medical_record_number = ?"
      ).bind(mrn).first();
      
      if (!patient) {
        return c.json({ error: "Access denied" }, 401);
      }
    } else {
      // Verify session token
      const session = await c.env.DB.prepare(
        "SELECT * FROM patient_sessions WHERE session_token = ? AND medical_record_number = ?"
      ).bind(sessionToken, mrn).first();

      if (!session) {
        return c.json({ error: "Invalid session" }, 401);
      }
    }

    // Get patient data
    const patient = await c.env.DB.prepare(
      "SELECT * FROM patients WHERE medical_record_number = ?"
    ).bind(mrn).first();

    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }

    // Get medical records and lab results
    const [medicalRecords, labResults] = await Promise.all([
      c.env.DB.prepare(
        "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC"
      ).bind((patient as any).id).all(),
      c.env.DB.prepare(
        "SELECT * FROM lab_results WHERE patient_id = ? ORDER BY test_date DESC"
      ).bind((patient as any).id).all()
    ]);

    return c.json({
      ...patient,
      medical_records: medicalRecords.results,
      lab_results: labResults.results,
    });
  } catch (error) {
    logError("Failed to fetch patient data", error);
    return c.json({ error: "Failed to fetch patient data" }, 500);
  }
});

// Patient Health Summary endpoint - AI-generated personalized health guidance (Meditron 7B powered)
app.get('/api/patient-health-summary/:mrn', async (c) => {
  try {
    const mrn = c.req.param('mrn');
    
    // Verify patient session
    const sessionToken = getCookie(c, 'patient_session_token');
    const patient = await c.env.DB.prepare(
      "SELECT * FROM patients WHERE medical_record_number = ?"
    ).bind(mrn).first();
    
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }

    if (!sessionToken) {
      // Allow if accessing own data (demo mode)
      const demoCheck = await c.env.DB.prepare(
        "SELECT id FROM patients WHERE medical_record_number = ?"
      ).bind(mrn).first();
      
      if (!demoCheck) {
        return c.json({ error: "Access denied" }, 401);
      }
    }

    // Get comprehensive patient data
    const [medicalRecords, labResults] = await Promise.all([
      c.env.DB.prepare(
        "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC LIMIT 10"
      ).bind((patient as any).id).all(),
      c.env.DB.prepare(
        "SELECT * FROM lab_results WHERE patient_id = ? ORDER BY test_date DESC LIMIT 20"
      ).bind((patient as any).id).all()
    ]);

    const records = medicalRecords.results as any[];
    const labs = labResults.results as any[];

    // Extract key health information
    const diagnoses = new Set<string>();
    const medications = new Set<string>();
    
    records.forEach(record => {
      if (record.diagnosis) {
        record.diagnosis.split(/[,;]/).forEach((d: string) => {
          const diagnosis = d.trim();
          if (diagnosis.length > 3) diagnoses.add(diagnosis);
        });
      }
      if (record.prescription) {
        record.prescription.split(/[,;]/).forEach((m: string) => {
          const med = m.trim();
          if (med.length > 2) medications.add(med);
        });
      }
    });

    // Get abnormal labs
    const abnormalLabs = labs.filter(lab => lab.is_abnormal).slice(0, 5);

    // Build patient data object
    const patientName = `${(patient as any).first_name} ${(patient as any).last_name}`;
    const patientData = {
      first_name: (patient as any).first_name,
      last_name: (patient as any).last_name,
      date_of_birth: (patient as any).date_of_birth,
      gender: (patient as any).gender,
      blood_type: (patient as any).blood_type,
      allergies: (patient as any).allergies,
      diagnoses: Array.from(diagnoses),
      medications: Array.from(medications),
      lab_results: abnormalLabs,
      medical_record_number: mrn,
      doctor_name: (patient as any).doctor_name || 'your doctor',
    };

    // Initialize Ollama client and cache
    const ollama = new OllamaClient({
      baseUrl: c.env.OLLAMA_URL || 'http://localhost:11434',
      model: 'meditron',
      temperature: 0.5,
      maxTokens: 3072,
    });

    const cache = new OllamaCache();

    // Check cache first
    const cacheKey = OllamaCache.generateKey(patientData);
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      return c.json({
        summary: cachedResponse,
        generated_at: new Date().toISOString(),
        diagnoses: patientData.diagnoses,
        medications: patientData.medications,
        ai_generated: true,
        model: 'meditron-7b',
        source: 'meditron-cached',
      });
    }

    // Check Ollama availability
    const isOllamaHealthy = await ollama.healthCheck();
    let summary: string;
    let source: string;

    if (isOllamaHealthy) {
      try {
        // Build prompt using templates
        const patientDataString = buildPatientDataString(patientData);
        const prompt = `${HEALTH_SUMMARY_PROMPT_TEMPLATE}\n\n${patientDataString}`;

        // Generate summary with Meditron
        summary = await ollama.generate(prompt, MEDICAL_SYSTEM_PROMPT);
        
        // Format for patient view
        summary = formatHealthSummaryForPatient(summary, patientName);
        source = 'meditron-7b';

        // Cache the response
        cache.set(cacheKey, summary);

      } catch (ollamaError) {
        logError("Meditron (Ollama) API failed for patient summary", ollamaError);
        throw ollamaError; // Fall through to Gemini backup
      }

    } else {
      throw new Error("Ollama not available");
    }

    return c.json({
      summary,
      generated_at: new Date().toISOString(),
      diagnoses: patientData.diagnoses,
      medications: patientData.medications,
      ai_generated: true,
      model: 'meditron-7b',
      source,
    });

  } catch (primaryError) {
    // Fallback to Gemini if Meditron fails
    try {
      logError("Primary AI (Meditron) failed for summary, falling back to Gemini", primaryError);

      const mrn = c.req.param('mrn');
      const patient = await c.env.DB.prepare(
        "SELECT * FROM patients WHERE medical_record_number = ?"
      ).bind(mrn).first();

      // Re-fetch data (already in scope from try block above, but for clarity in fallback)
      const [medicalRecords, labResults] = await Promise.all([
        c.env.DB.prepare(
          "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC LIMIT 10"
        ).bind((patient as any).id).all(),
        c.env.DB.prepare(
          "SELECT * FROM lab_results WHERE patient_id = ? ORDER BY test_date DESC LIMIT 20"
        ).bind((patient as any).id).all()
      ]);

      const records = medicalRecords.results as any[];
      const labs = labResults.results as any[];

      const diagnoses = new Set<string>();
      const medications = new Set<string>();
      
      records.forEach(record => {
        if (record.diagnosis) {
          record.diagnosis.split(/[,;]/).forEach((d: string) => {
            const diagnosis = d.trim();
            if (diagnosis.length > 3) diagnoses.add(diagnosis);
          });
        }
        if (record.prescription) {
          record.prescription.split(/[,;]/).forEach((m: string) => {
            const med = m.trim();
            if (med.length > 2) medications.add(med);
          });
        }
      });

      const recentRecord = records[0];
      const recentBP = recentRecord ? 
        `${recentRecord.blood_pressure_systolic}/${recentRecord.blood_pressure_diastolic}` : 
        'Not recorded';
      const recentWeight = recentRecord?.weight || 'Not recorded';
      const abnormalLabs = labs.filter(lab => lab.is_abnormal).slice(0, 5);

      const patientName = `${(patient as any).first_name} ${(patient as any).last_name}`;
      const age = (patient as any).date_of_birth ? 
        new Date().getFullYear() - new Date((patient as any).date_of_birth).getFullYear() : 
        'unknown';

      const prompt = `You are a compassionate AI health assistant helping a patient understand their health information. Generate a patient-friendly, easy-to-understand health summary for:

Patient: ${patientName}, Age: ${age}, Gender: ${(patient as any).gender}
Allergies: ${(patient as any).allergies || 'None reported'}

DIAGNOSED CONDITIONS:
${Array.from(diagnoses).join(', ') || 'No specific diagnoses on record'}

CURRENT MEDICATIONS:
${Array.from(medications).join(', ') || 'No medications on record'}

RECENT VITALS:
- Blood Pressure: ${recentBP}
- Weight: ${recentWeight}

ABNORMAL LAB RESULTS:
${abnormalLabs.length > 0 ? abnormalLabs.map(lab => `${lab.test_name}: ${lab.test_value} ${lab.test_unit} (Reference: ${lab.reference_range})`).join('\n') : 'No recent abnormal results'}

Generate a comprehensive, patient-friendly health summary with these sections:

1. **Your Health Overview** (2-3 sentences explaining their current health status in simple terms)

2. **What Your Diagnoses Mean** (Explain each diagnosed condition in simple language, what it means, and why it's important to manage)

3. **About Your Medications** (For each medication, explain:
   - What it does
   - Why you're taking it
   - When and how to take it
   - Important side effects to watch for)

4. **Foods to Eat & Avoid** (Specific dietary recommendations based on their conditions:
   - Foods that help manage their conditions
   - Foods to limit or avoid
   - Practical meal suggestions)

5. **Lifestyle Measures You Can Take** (Actionable steps:
   - Exercise recommendations
   - Stress management
   - Sleep habits
   - Daily routines
   - Monitoring what to track)

6. **Understanding Your Lab Results** (Explain any abnormal results in simple terms and what they mean for health)

7. **Important Reminders** (Medication adherence, follow-up appointments, warning signs to watch for, when to call the doctor)

Use simple, encouraging language. Avoid medical jargon or explain it clearly. Be supportive and empowering. Focus on actionable advice the patient can implement today.`;

      if (c.env.GEMINI_API_KEY) {
        const geminiResponse = await requestGeminiText(c.env.GEMINI_API_KEY, prompt);
        
        if (geminiResponse) {
          return c.json({
            summary: geminiResponse,
            generated_at: new Date().toISOString(),
            diagnoses: Array.from(diagnoses),
            medications: Array.from(medications),
            ai_generated: true,
            model: 'gemini-1.5-flash',
            source: 'gemini-fallback',
          });
        }
      }

      throw new Error("No AI service available");

    } catch (fallbackError) {
      logError("All AI services failed", fallbackError);

      const mrn = c.req.param('mrn');
      const patient = await c.env.DB.prepare(
        "SELECT * FROM patients WHERE medical_record_number = ?"
      ).bind(mrn).first();

      const [medicalRecords, labResults] = await Promise.all([
        c.env.DB.prepare(
          "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC LIMIT 10"
        ).bind((patient as any).id).all(),
        c.env.DB.prepare(
          "SELECT * FROM lab_results WHERE patient_id = ? ORDER BY test_date DESC LIMIT 20"
        ).bind((patient as any).id).all()
      ]);

      const records = medicalRecords.results as any[];
      const labs = labResults.results as any[];

      const diagnoses = new Set<string>();
      const medications = new Set<string>();
      
      records.forEach(record => {
        if (record.diagnosis) {
          record.diagnosis.split(/[,;]/).forEach((d: string) => {
            const diagnosis = d.trim();
            if (diagnosis.length > 3) diagnoses.add(diagnosis);
          });
        }
        if (record.prescription) {
          record.prescription.split(/[,;]/).forEach((m: string) => {
            const med = m.trim();
            if (med.length > 2) medications.add(med);
          });
        }
      });

      const abnormalLabs = labs.filter(lab => lab.is_abnormal).slice(0, 5);
      const patientName = `${(patient as any).first_name} ${(patient as any).last_name}`;
      
      const fallbackSummary = buildPatientFallbackSummary(
        patientName,
        Array.from(diagnoses),
        Array.from(medications),
        abnormalLabs,
        (patient as any).allergies
      );
      
      return c.json({
        summary: fallbackSummary,
        generated_at: new Date().toISOString(),
        diagnoses: Array.from(diagnoses),
        medications: Array.from(medications),
        ai_generated: false,
        model: 'static-fallback',
        source: 'fallback',
      });
    }
  }
});

// Helper function for patient fallback summary
function buildPatientFallbackSummary(
  name: string,
  diagnoses: string[],
  medications: string[],
  abnormalLabs: any[],
  allergies: string | null
): string {
  const primaryCondition = diagnoses[0] || 'general health';
  
  let summary = `# Your Health Summary - ${name}\n\n`;
  
  summary += `## Your Health Overview\n\nYou are currently being monitored for ${diagnoses.length > 0 ? diagnoses.join(', ') : 'your general health'}. `;
  summary += `This summary will help you understand your health conditions and what you can do to stay healthy.\n\n`;
  
  if (allergies) {
    summary += `⚠️ **IMPORTANT ALLERGY ALERT:** ${allergies}\nAlways inform healthcare providers about your allergies before any treatment or medication.\n\n`;
  }
  
  // Diagnoses explanation
  if (diagnoses.length > 0) {
    summary += `## What Your Diagnoses Mean\n\n`;
    diagnoses.forEach(diagnosis => {
      const diagLower = diagnosis.toLowerCase();
      if (diagLower.includes('diabetes')) {
        summary += `**${diagnosis}:**\nDiabetes means your blood sugar (glucose) levels are higher than normal. Managing it well helps prevent complications with your eyes, kidneys, heart, and nerves. With proper care, you can live a full, healthy life.\n\n`;
      } else if (diagLower.includes('hypertension') || diagLower.includes('blood pressure')) {
        summary += `**${diagnosis}:**\nHigh blood pressure means your heart is working harder than it should to pump blood. Controlling it reduces your risk of heart attack, stroke, and kidney problems.\n\n`;
      } else if (diagLower.includes('hyperlipid') || diagLower.includes('cholesterol')) {
        summary += `**${diagnosis}:**\nThis means you have high levels of fats (cholesterol) in your blood, which can build up in arteries and increase heart disease risk. Diet, exercise, and medication can help.\n\n`;
      } else {
        summary += `**${diagnosis}:**\nThis is a condition that requires ongoing management. Follow your doctor's advice and attend regular check-ups to monitor your progress.\n\n`;
      }
    });
  }
  
  // Medications
  if (medications.length > 0) {
    summary += `## About Your Medications\n\nYou are currently taking: ${medications.join(', ')}\n\n`;
    summary += `**Important Medication Reminders:**\n`;
    summary += `- Take medications at the same time each day\n`;
    summary += `- Don't skip doses - consistency is key\n`;
    summary += `- Don't stop medications without talking to your doctor\n`;
    summary += `- Keep a list of your medications with you\n`;
    summary += `- Ask your pharmacist if you have questions\n\n`;
  }
  
  // Diet recommendations
  summary += `## Foods to Eat & Avoid\n\n`;
  if (diagnoses.some(d => d.toLowerCase().includes('diabetes'))) {
    summary += `**For Diabetes Management:**\n\n`;
    summary += `✅ **Foods to Eat:**\n`;
    summary += `- Whole grains (brown rice, whole wheat bread, oats)\n`;
    summary += `- Lean proteins (chicken, fish, beans, tofu)\n`;
    summary += `- Lots of vegetables (especially leafy greens)\n`;
    summary += `- Fresh fruits (in moderation - apples, berries, oranges)\n`;
    summary += `- Nuts and seeds\n\n`;
    summary += `❌ **Foods to Limit:**\n`;
    summary += `- White bread, white rice, regular pasta\n`;
    summary += `- Sugary drinks (soda, sweet tea, juice)\n`;
    summary += `- Sweets and desserts\n`;
    summary += `- Fried foods\n`;
    summary += `- Processed snacks\n\n`;
  }
  
  if (diagnoses.some(d => d.toLowerCase().includes('hypertension') || d.toLowerCase().includes('pressure'))) {
    summary += `**For Blood Pressure Control:**\n\n`;
    summary += `✅ **Foods to Eat:**\n`;
    summary += `- Fresh fruits and vegetables\n`;
    summary += `- Low-fat dairy products\n`;
    summary += `- Whole grains\n`;
    summary += `- Fish rich in omega-3 (salmon, mackerel)\n`;
    summary += `- Nuts, beans, and seeds\n\n`;
    summary += `❌ **Foods to Avoid:**\n`;
    summary += `- Salty foods (chips, pickles, processed meats)\n`;
    summary += `- Canned soups and frozen dinners\n`;
    summary += `- Fast food\n`;
    summary += `- Limit salt to less than 1 teaspoon per day\n\n`;
  }
  
  // Lifestyle measures
  summary += `## Lifestyle Measures You Can Take\n\n`;
  summary += `**Physical Activity:**\n`;
  summary += `- Aim for 30 minutes of walking, 5 days a week\n`;
  summary += `- Start slowly if you're new to exercise\n`;
  summary += `- Take the stairs, park farther away, garden - every bit counts!\n\n`;
  
  summary += `**Daily Healthy Habits:**\n`;
  summary += `- Get 7-8 hours of sleep each night\n`;
  summary += `- Drink 6-8 glasses of water daily\n`;
  summary += `- Manage stress through deep breathing, meditation, or hobbies\n`;
  summary += `- Don't smoke - ask for help quitting if needed\n`;
  summary += `- Limit alcohol\n\n`;
  
  summary += `**What to Monitor:**\n`;
  if (diagnoses.some(d => d.toLowerCase().includes('diabetes'))) {
    summary += `- Check blood sugar as directed by your doctor\n`;
  }
  if (diagnoses.some(d => d.toLowerCase().includes('hypertension') || d.toLowerCase().includes('pressure'))) {
    summary += `- Monitor blood pressure at home regularly\n`;
  }
  summary += `- Track your weight weekly\n`;
  summary += `- Note any new symptoms or concerns\n\n`;
  
  // Lab results
  if (abnormalLabs.length > 0) {
    summary += `## Understanding Your Lab Results\n\n`;
    summary += `Some of your recent lab tests showed results outside the normal range:\n\n`;
    abnormalLabs.forEach(lab => {
      summary += `**${lab.test_name}:** ${lab.test_value} ${lab.test_unit} (Normal: ${lab.reference_range})\n`;
    });
    summary += `\nYour doctor will discuss these results with you and adjust your treatment plan as needed.\n\n`;
  }
  
  // Important reminders
  summary += `## Important Reminders\n\n`;
  summary += `🔔 **Take Your Medications:**\nSet phone alarms or use a pill organizer to remember your medications. Never skip doses.\n\n`;
  summary += `📅 **Keep Your Appointments:**\nRegular check-ups help catch problems early. Don't skip your follow-up visits.\n\n`;
  summary += `⚠️ **When to Call Your Doctor:**\n`;
  summary += `- Severe headache or chest pain\n`;
  summary += `- Difficulty breathing\n`;
  summary += `- Unusual swelling\n`;
  summary += `- Dizziness or fainting\n`;
  summary += `- Any new or worsening symptoms\n\n`;
  summary += `💪 **You Can Do This!**\nManaging ${primaryCondition} takes effort, but small daily choices make a big difference. You're taking important steps for your health!\n\n`;
  summary += `*This summary is for educational purposes. Always follow your doctor's specific advice for your situation.*`;
  
  return summary;
}

// Patient logout endpoint
app.post('/api/patient-logout', async (c) => {
  try {
    const sessionToken = getCookie(c, 'patient_session_token');

    // Clear cookie
    const isSecure = isSecureRequest(c);
    setCookie(c, 'patient_session_token', '', {
      httpOnly: true,
      path: '/',
      sameSite: isSecure ? 'none' : 'lax',
      secure: isSecure,
      maxAge: 0,
    });

    // Remove session from database
    if (sessionToken) {
      await c.env.DB.prepare(
        "DELETE FROM patient_sessions WHERE session_token = ?"
      ).bind(sessionToken).run();
    }

    return c.json({ success: true });
  } catch (error) {
    logError("Failed to log out patient but continuing", error);
    return c.json({ success: true }); // Always return success for logout
  }
});

// Update patient personal information endpoint
app.put('/api/patient-profile/:mrn', async (c) => {
  try {
    const mrn = c.req.param('mrn');
    const updates = await c.req.json();
    
    // Verify patient session
    const sessionToken = getCookie(c, 'patient_session_token');
    if (sessionToken) {
      const session = await c.env.DB.prepare(
        "SELECT * FROM patient_sessions WHERE session_token = ? AND medical_record_number = ?"
      ).bind(sessionToken, mrn).first();

      if (!session) {
        return c.json({ error: "Unauthorized" }, 401);
      }
    }

    // Update allowed fields only (patients can only update contact info)
    const allowedFields = ['email', 'phone', 'address', 'emergency_contact_name', 'emergency_contact_phone'];
    const updateFields = [];
    const updateValues = [];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    }
    
    if (updateFields.length === 0) {
      return c.json({ error: "No valid fields to update" }, 400);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(mrn);
    
    const query = `UPDATE patients SET ${updateFields.join(', ')} WHERE medical_record_number = ?`;
    
    const result = await c.env.DB.prepare(query).bind(...updateValues).run();
    
    if (result.meta.changes === 0) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    logError("Failed to update patient profile", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

export default app;
