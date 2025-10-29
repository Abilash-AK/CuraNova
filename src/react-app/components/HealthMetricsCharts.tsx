import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Activity, Heart, TrendingUp, Thermometer } from 'lucide-react';
import type { MedicalRecord, LabResult } from '@/shared/types';

interface HealthMetricsChartsProps {
  medicalRecords: MedicalRecord[];
  labResults: LabResult[];
}

export default function HealthMetricsCharts({ medicalRecords, labResults }: HealthMetricsChartsProps) {
  type ChartTooltipPayload = {
    color: string;
    name: string;
    value: number;
    payload: { unit?: string };
  };

  type CustomTooltipProps = {
    active?: boolean;
    payload?: ChartTooltipPayload[];
    label?: string | number;
  };

  // Process vital signs data - Sort first, then format dates to prevent date parsing issues
  const vitalsData = medicalRecords
    .filter(record => record.blood_pressure_systolic || record.heart_rate || record.temperature)
    .sort((a, b) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime())
    .slice(-10) // Show last 10 readings
    .map((record, index) => ({
      date: new Date(record.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      id: `vital-${index}-${new Date(record.visit_date).getTime()}`,
      systolic: record.blood_pressure_systolic || undefined,
      diastolic: record.blood_pressure_diastolic || undefined,
      heartRate: record.heart_rate || undefined,
      temperature: record.temperature || undefined,
      weight: record.weight || undefined,
    }));

  // Process lab results data for common tests - Sort first, then format dates
  const processLabData = (testName: string) => {
    return labResults
      .filter(result => result.test_name.toLowerCase().includes(testName.toLowerCase()))
      .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
      .slice(-8)
      .map((result, index) => ({
        date: new Date(result.test_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        id: `lab-${testName}-${index}-${new Date(result.test_date).getTime()}`,
        value: parseFloat(result.test_value) || 0,
        isAbnormal: result.is_abnormal,
        unit: result.test_unit || '',
        reference: result.reference_range || '',
      }));
  };

  const glucoseData = processLabData('glucose').length > 0 ? processLabData('glucose') : processLabData('sugar');
  const cholesterolData = processLabData('cholesterol');
  const hemoglobinData = processLabData('hemoglobin').length > 0 ? processLabData('hemoglobin') : processLabData('hgb');
  const a1cData = processLabData('a1c');

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.payload.unit ?? ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (vitalsData.length === 0 && glucoseData.length === 0 && cholesterolData.length === 0 && hemoglobinData.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">No health metrics data available yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Add medical records and lab results to see trends</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Blood Pressure & Heart Rate */}
      {vitalsData.length > 0 && (vitalsData.some(d => d.systolic) || vitalsData.some(d => d.heartRate)) && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Vital Signs Trends</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {vitalsData.some(d => d.systolic) && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Blood Pressure (mmHg)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={vitalsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Systolic"
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      name="Diastolic"
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {vitalsData.some(d => d.heartRate) && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Heart Rate (bpm)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={vitalsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      name="Heart Rate"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Temperature & Weight */}
      {vitalsData.length > 0 && (vitalsData.some(d => d.temperature) || vitalsData.some(d => d.weight)) && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Thermometer className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Physical Measurements</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {vitalsData.some(d => d.temperature) && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Temperature (°F)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={vitalsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[96, 104]} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Temperature"
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {vitalsData.some(d => d.weight) && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Weight (lbs)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={vitalsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      name="Weight"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lab Results */}
      {(glucoseData.length > 0 || cholesterolData.length > 0 || hemoglobinData.length > 0 || a1cData.length > 0) && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Lab Results Trends</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {glucoseData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Blood Glucose</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={glucoseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      name="Glucose"
                      fill="#22c55e"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {cholesterolData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Cholesterol</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={cholesterolData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Cholesterol"
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {hemoglobinData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Hemoglobin</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={hemoglobinData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#dc2626" 
                      fill="#dc2626"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      name="Hemoglobin"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {a1cData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Hemoglobin A1C</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={a1cData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#7c3aed" 
                      strokeWidth={2}
                      name="A1C"
                      dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
