import { useCallback, useEffect, useState } from "react";
import { hospitalApi } from "../hospitalApi";

const EMPTY = Object.freeze({ appointments: [], patients: [], staff: [], referrals: [], alerts: [], activityLogs: [], users: [], messages: [], notifications: [], facility: {}, settings: {} });
const selectedPatientId = () => window.sessionStorage.getItem("selectedPatientId");
const valueOf = (result, key, fallback) => result.status === "fulfilled" ? (result.value?.[key] ?? fallback) : fallback;
const facilityFromSession = () => hospitalApi.session()?.membership?.facility || {};
const mapAppointment = (item) => ({
  ...item,
  start: item.start || item.date,
  status: item.status === "CONFIRMED" ? "UPCOMING" : item.status === "CANCELLED" ? "CANCELED" : item.status
});
const apiAppointmentChange = (change) => {
  if (typeof change !== "string") return { ...change, ...(change?.status === "UPCOMING" ? { status: "CONFIRMED" } : change?.status === "CANCELED" ? { status: "CANCELLED" } : {}) };
  return { status: change === "UPCOMING" ? "CONFIRMED" : change === "CANCELED" ? "CANCELLED" : change };
};
const apiReferralChange = (change) => typeof change !== "string" ? change : ({ ACCEPTED: "accept", DECLINED: "decline", CANCELED: "cancel", CANCELLED: "cancel", COMPLETED: "complete" }[change.toUpperCase()] || change);
const verificationDocumentName = (type) => ({
  REGISTRATION_CERTIFICATE: "Facility Registration Certificate", ADMIN_ID: "Valid ID of Facility Owner / Admin",
  FACILITY_LICENSE: "Healthcare Facility License", MEDICAL_DIRECTOR_LICENSE: "Medical Director’s Practicing License",
  ADDRESS_PROOF: "Proof of Facility Address"
}[type] || type);

// Server records stay in React memory. The legacy browser cache is removed on
// mount because clinical and operational data must come from the shared API.
export function useHospitalData() {
  const [data, setData] = useState(() => ({ ...EMPTY, facility: facilityFromSession() }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    window.localStorage.removeItem("axonlink-hospital-data-v1");
    setLoading(true); setError("");
    const patientId = selectedPatientId();
    const results = await Promise.allSettled([
      hospitalApi.listAppointments(), hospitalApi.listPatients(), hospitalApi.listStaff(),
      hospitalApi.listReferrals(), hospitalApi.listNotifications(), hospitalApi.getVerificationStatus(),
      patientId ? hospitalApi.clinicalRecords(patientId) : Promise.resolve(null)
    ]);
    const [appointments, patients, staff, referrals, notifications, verification, clinical] = results;
    const failed = results.slice(0, 6).find((item) => item.status === "rejected");
    const patientList = valueOf(patients, "patients", []);
    const clinicalPatient = clinical.status === "fulfilled" ? clinical.value?.patient : null;
    const staffRecords = valueOf(staff, "staff", []);
    const invitations = valueOf(staff, "invitations", []).map((item) => ({ ...item, pendingInvitation: true, name: item.email }));
    const documents = valueOf(verification, "documents", []).map((item) => ({ ...item, name: verificationDocumentName(item.type), fileName: item.originalName, uploadedAt: item.createdAt }));
    setData({
      ...EMPTY,
      appointments: valueOf(appointments, "appointments", []).map(mapAppointment),
      patients: clinicalPatient ? patientList.map((item) => item.id === clinicalPatient.id ? clinicalPatient : item) : patientList,
      staff: [...staffRecords, ...invitations],
      referrals: valueOf(referrals, "referrals", []),
      notifications: valueOf(notifications, "notifications", []),
      facility: { ...facilityFromSession(), ...(verification.status === "fulfilled" ? verification.value?.facility : {}) },
      settings: { verificationDocuments: documents },
      activityLogs: clinical.status === "fulfilled" ? (clinical.value?.audit || []).map((item) => ({ ...item, type: "PATIENT_ACCESS", staffName: item.actor?.name, recordType: item.categories?.join(", ") })) : []
    });
    if (failed) setError(failed.reason?.message || "Some hospital information could not be loaded.");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const unsupported = async () => { throw new Error("This feature is not available until its shared-backend endpoint is enabled."); };
  const updateAppointment = async (id, change) => { const result = await hospitalApi.updateAppointment(id, apiAppointmentChange(change)); await load(); return result?.appointment || result; };
  const updateReferral = async (id, change) => { const result = await hospitalApi.updateReferral(id, apiReferralChange(change)); await load(); return result?.referral || result; };
  const updateStaff = async (id, change) => { if (!change?.status) return unsupported(); await hospitalApi.setStaffStatus(id, change.status); await load(); };
  const removeStaff = async (id) => { await hospitalApi.removeStaff(id); await load(); };
  const updateNotification = async (id, change) => { if (change?.read) await hospitalApi.markNotificationRead(id); setData((current) => ({ ...current, notifications: current.notifications.map((item) => item.id === id ? { ...item, ...change } : item) })); };
  const deleteNotification = async (id) => { await hospitalApi.deleteNotification(id); setData((current) => ({ ...current, notifications: current.notifications.filter((item) => item.id !== id) })); };
  const updateFacility = async (change) => { const result = await hospitalApi.updateFacility(change); await load(); return result?.facility || result; };

  return {
    data, loading, error, reload: load,
    addAppointment: hospitalApi.createAppointment, addPatient: hospitalApi.registerPatient, addVisit: unsupported,
    addHealthCondition: (id, value) => hospitalApi.createClinicalRecord(id, "conditions", value), updateHealthCondition: (id, recordId, value) => hospitalApi.updateClinicalRecord(id, "conditions", recordId, value), addConditionNote: unsupported,
    addMedication: (id, value) => hospitalApi.createClinicalRecord(id, "medications", value), updateMedication: (id, recordId, value) => hospitalApi.updateClinicalRecord(id, "medications", recordId, value),
    addAllergy: (id, value) => hospitalApi.createClinicalRecord(id, "allergies", value), updateAllergy: (id, recordId, value) => hospitalApi.updateClinicalRecord(id, "allergies", recordId, value), addAllergyNote: unsupported,
    addLab: (id, value) => hospitalApi.createClinicalRecord(id, "labs", value), updateLab: (id, recordId, value) => hospitalApi.updateClinicalRecord(id, "labs", recordId, value),
    addVaccination: (id, value) => hospitalApi.createClinicalRecord(id, "vaccinations", value), updateVaccination: (id, recordId, value) => hospitalApi.updateClinicalRecord(id, "vaccinations", recordId, value),
    updateAppointment, updateReferral, addStaff: unsupported, updateStaff, removeStaff,
    sendMessage: unsupported, updateNotification, deleteNotification, updateFacility, updateHospitalSettings: unsupported
  };
}

export function formatTime(value) { return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Time not recorded"; }
export function formatDate(value) { return value ? new Date(value).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" }) : "Date not recorded"; }
