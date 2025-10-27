import { useState, useEffect, useCallback } from 'react';
import type { Patient, MedicalRecord, LabResult, DashboardStats, PatientWithRecords } from '@/shared/types';

type UseApiOptions = {
  pollInterval?: number;
};

export function useApi<T>(url: string, options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = (await response.json()) as T;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!options?.pollInterval) {
      return;
    }

    const timerId = window.setInterval(() => {
      void fetchData();
    }, options.pollInterval);

    return () => {
      window.clearInterval(timerId);
    };
  }, [fetchData, options?.pollInterval]);

  return { data, loading, error, refetch: fetchData };
}

export function useDashboardStats() {
  return useApi<DashboardStats>('/api/dashboard/stats', { pollInterval: 15000 });
}

export function usePatients(search: string = '') {
  const url = search ? `/api/patients?search=${encodeURIComponent(search)}` : '/api/patients';
  return useApi<Patient[]>(url);
}

export function usePatient(id: string) {
  return useApi<PatientWithRecords>(`/api/patients/${id}`);
}

export async function createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
  const response = await fetch('/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patient),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Create patient error:', errorData);
    throw new Error(`Failed to create patient: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function updatePatient(id: number, patient: Partial<Patient>): Promise<Patient> {
  const response = await fetch(`/api/patients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patient),
  });

  if (!response.ok) {
    throw new Error('Failed to update patient');
  }

  return response.json();
}

export async function createMedicalRecord(patientId: string, record: Omit<MedicalRecord, 'id' | 'patient_id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MedicalRecord> {
  const response = await fetch(`/api/patients/${patientId}/medical-records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error('Failed to create medical record');
  }

  return response.json();
}

export async function createLabResult(patientId: string, result: Omit<LabResult, 'id' | 'patient_id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<LabResult> {
  const response = await fetch(`/api/patients/${patientId}/lab-results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(result),
  });

  if (!response.ok) {
    throw new Error('Failed to create lab result');
  }

  return response.json();
}

export async function deletePatient(id: number): Promise<void> {
  const response = await fetch(`/api/patients/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete patient');
  }
}

export async function updateMedicalRecord(patientId: string, recordId: number, record: Partial<MedicalRecord>): Promise<MedicalRecord> {
  const response = await fetch(`/api/patients/${patientId}/medical-records/${recordId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error('Failed to update medical record');
  }

  return response.json();
}

export async function deleteMedicalRecord(patientId: string, recordId: number): Promise<void> {
  const response = await fetch(`/api/patients/${patientId}/medical-records/${recordId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete medical record');
  }
}

export async function updateLabResult(patientId: string, resultId: number, result: Partial<LabResult>): Promise<LabResult> {
  const response = await fetch(`/api/patients/${patientId}/lab-results/${resultId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(result),
  });

  if (!response.ok) {
    throw new Error('Failed to update lab result');
  }

  return response.json();
}

export async function deleteLabResult(patientId: string, resultId: number): Promise<void> {
  const response = await fetch(`/api/patients/${patientId}/lab-results/${resultId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete lab result');
  }
}
