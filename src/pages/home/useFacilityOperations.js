import { useCallback, useEffect, useState } from "react";
import { hospitalApi } from "../../hospitalApi";

const uiStatus = (status) => status === "CONFIRMED" ? "UPCOMING" : status === "CANCELLED" ? "CANCELED" : status;
const apiStatus = (status) => status === "UPCOMING" ? "CONFIRMED" : status === "CANCELED" ? "CANCELLED" : status;

export function mapFacilityAppointment(item) {
  const start = item?.date || item?.start;
  const end = item?.end || (start ? new Date(new Date(start).getTime() + 30 * 60 * 1000).toISOString() : start);
  return { ...item, start, end, type: item?.visitType || item?.type, status: uiStatus(item?.status) };
}

export function useFacilityAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const result = await hospitalApi.listAppointments(); setAppointments((result?.appointments || []).map(mapFacilityAppointment)); }
    catch (reason) { setAppointments([]); setError(reason?.message || "Unable to load appointments."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const createAppointment = async (values) => { const result = await hospitalApi.createAppointment(values); const created = mapFacilityAppointment(result?.appointment || result); setAppointments((current) => [...current.filter((item) => item.id !== created.id), created]); return created; };
  const updateAppointment = async (id, values) => { const change = typeof values === "string" ? { status: apiStatus(values) } : { ...values, ...(values.status ? { status: apiStatus(values.status) } : {}) }; const result = await hospitalApi.updateAppointment(id, change); const updated = mapFacilityAppointment(result?.appointment || result); setAppointments((current) => current.map((item) => item.id === id ? updated : item)); return updated; };
  return { appointments, setAppointments, loading, error, reload: load, createAppointment, updateAppointment };
}

export function useFacilityStaff() {
  const [records, setRecords] = useState({ staff: [], invitations: [] }); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { let active = true; hospitalApi.listStaff().then((result) => active && setRecords({ staff: result?.staff || [], invitations: result?.invitations || [] })).catch((reason) => active && setError(reason?.message || "Unable to load staff.")).finally(() => active && setLoading(false)); return () => { active = false; }; }, []);
  return { ...records, loading, error };
}

export function useAppointmentOptions(enabled = true) {
  const [options, setOptions] = useState({ patients: [], clinicians: [] }); const [loading, setLoading] = useState(enabled); const [error, setError] = useState("");
  useEffect(() => { if (!enabled) return; let active = true; setLoading(true); hospitalApi.appointmentOptions().then((result) => active && setOptions({ patients: result?.patients || [], clinicians: result?.clinicians || [] })).catch((reason) => active && setError(reason?.message || "Unable to load appointment options.")).finally(() => active && setLoading(false)); return () => { active = false; }; }, [enabled]);
  return { ...options, loading, error };
}
