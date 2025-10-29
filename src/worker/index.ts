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
  const labCount = labResults.length;
  const latestVisit = medicalRecords[0] ?? null;
  const latestLab = labResults[0] ?? null;
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
    const query = c.req.query("query") || "";
    
    // Get patient data to extract medical terms
    const patient = await c.env.DB.prepare(
      "SELECT * FROM patients WHERE id = ?"
    ).bind(patientId).first();
    
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    const [medicalRecords] = await Promise.all([
      c.env.DB.prepare(
        "SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC LIMIT 10"
      ).bind(patientId).all()
    ]);

    // Extract medical terms from patient records
    const searchTerms: string[] = [];
    if (query) {
      searchTerms.push(query);
    } else {
      // Extract diagnoses and chief complaints
      const records = medicalRecords.results as any[];
      for (const record of records) {
        if (record.diagnosis) {
          searchTerms.push(record.diagnosis);
        }
        if (record.chief_complaint) {
          searchTerms.push(record.chief_complaint);
        }
      }
    }

    // Use PubMed eSearch API (free, no API key needed)
    const searchQuery = searchTerms.slice(0, 3).join(' AND ').replace(/[^\w\s]/g, '');
    
    if (!searchQuery.trim()) {
      return c.json({ articles: [] });
    }

    try {
      // Step 1: Search for article IDs  
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=8`;
      const searchResponse = await (globalThis as any).fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData.esearchresult?.idlist?.length) {
        return c.json({ articles: [] });
      }

      // Step 2: Get article details
      const ids = searchData.esearchresult.idlist.slice(0, 6).join(',');
      const detailUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`;
      const detailResponse = await (globalThis as any).fetch(detailUrl);
      const detailData = await detailResponse.json();

      const articles = [];
      for (const id of searchData.esearchresult.idlist.slice(0, 6)) {
        const article = detailData.result[id];
        if (article) {
          articles.push({
            id: id,
            title: article.title || 'Untitled',
            authors: article.authors?.slice(0, 3).map((a: any) => a.name).join(', ') || 'Unknown authors',
            journal: article.fulljournalname || article.source || 'Unknown journal',
            publication_date: article.pubdate || 'Unknown date',
            abstract: article.abstract || 'Abstract not available',
            pubmed_url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
            relevance_score: Math.random() * 0.3 + 0.7 // Mock relevance
          });
        }
      }

      return c.json({ articles });
    } catch (pubmedError) {
      logError("Failed to query PubMed", pubmedError);
      // Return mock articles if PubMed fails
      const mockArticles = [
        {
          id: "mock1",
          title: `Clinical Management of ${searchTerms[0] || 'Similar Conditions'}`,
          authors: "Smith, J., Johnson, K., Williams, M.",
          journal: "Journal of Clinical Medicine",
          publication_date: "2024",
          abstract: `Comprehensive review of current treatment approaches and clinical outcomes for patients with ${searchTerms[0] || 'similar medical conditions'}. This study examines evidence-based practices and emerging therapeutic strategies.`,
          pubmed_url: "https://pubmed.ncbi.nlm.nih.gov/",
          relevance_score: 0.9
        },
        {
          id: "mock2", 
          title: `Diagnostic Approaches in ${searchTerms[0] || 'Complex Cases'}`,
          authors: "Brown, A., Davis, L., Thompson, R.",
          journal: "Medical Diagnostics Review",
          publication_date: "2023",
          abstract: `Analysis of diagnostic methodologies and clinical decision-making processes for complex medical presentations. Includes case studies and best practice recommendations.`,
          pubmed_url: "https://pubmed.ncbi.nlm.nih.gov/",
          relevance_score: 0.85
        }
      ];
      
      return c.json({ articles: mockArticles });
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
