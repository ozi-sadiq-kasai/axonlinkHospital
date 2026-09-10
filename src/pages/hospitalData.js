import { useEffect, useState } from "react";

const KEY = "axonlink-hospital-data-v1";
const EMPTY = { appointments: [], patients: [], staff: [], referrals: [], alerts: [], activityLogs: [], users: [], messages: [], notifications: [], facility: {}, settings: {} };

export function useHospitalData() {
  const [data, setData] = useState(() => {
    try { return { ...EMPTY, ...JSON.parse(window.localStorage.getItem(KEY)) }; }
    catch { return EMPTY; }
  });
  useEffect(() => { window.localStorage.setItem(KEY, JSON.stringify(data)); }, [data]);
  const addAppointment = (appointment) => setData((current) => ({
    ...current,
    appointments: [...current.appointments, { ...appointment, id: crypto.randomUUID(), status: appointment.status || "UPCOMING" }],
    patients: current.patients.some((patient) => patient.name.toLowerCase() === appointment.patient.toLowerCase()) ? current.patients : [...current.patients, { id: crypto.randomUUID(), name: appointment.patient }],
  }));
  const addPatient = (patient) => {
    const created = { ...patient, id: crypto.randomUUID(), createdAt: new Date().toISOString(), visits: [], records: {} };
    setData((current) => ({ ...current, patients: [...current.patients, created] }));
    return created;
  };
  const addVisit = (patientId, visit) => {
    const created = { ...visit, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setData((current) => ({
      ...current,
      patients: current.patients.map((patient) => patient.id === patientId
        ? { ...patient, visits: [...(patient.visits || []), created] }
        : patient),
    }));
    return created;
  };
  const addHealthCondition = (patientId, condition) => {
    const createdAt = new Date().toISOString();
    const created = { ...condition, id: crypto.randomUUID(), createdAt, updatedAt: createdAt, notes: condition.notes || [], medications: condition.medications || [], investigations: condition.investigations || [], history: condition.history || [] };
    setData((current) => ({ ...current, patients: current.patients.map((patient) => patient.id === patientId ? {
      ...patient,
      records: { ...(patient.records || {}), conditions: [...(patient.records?.conditions || []), created] },
    } : patient) }));
    return created;
  };
  const updateHealthCondition = (patientId, conditionId, changes) => {
    const updatedAt = new Date().toISOString();
    setData((current) => ({ ...current, patients: current.patients.map((patient) => patient.id === patientId ? {
      ...patient,
      records: { ...(patient.records || {}), conditions: (patient.records?.conditions || []).map((condition) => condition.id === conditionId ? {
        ...condition,
        ...changes,
        updatedAt,
        history: [...(condition.history || []), { id: crypto.randomUUID(), changedAt: updatedAt, previous: condition }],
      } : condition) },
    } : patient) }));
  };
  const addConditionNote = (patientId, conditionId, note) => {
    const createdAt = new Date().toISOString();
    setData((current) => ({ ...current, patients: current.patients.map((patient) => patient.id === patientId ? {
      ...patient,
      records: { ...(patient.records || {}), conditions: (patient.records?.conditions || []).map((condition) => condition.id === conditionId ? {
        ...condition,
        updatedAt: createdAt,
        notes: [...(condition.notes || []), { ...note, id: crypto.randomUUID(), createdAt }],
      } : condition) },
    } : patient) }));
  };
  const addMedication = (patientId, medication) => {
    const createdAt = new Date().toISOString();
    const created = { ...medication, id: crypto.randomUUID(), createdAt, updatedAt: createdAt, history: [] };
    setData((current) => ({ ...current, patients: current.patients.map((patient) => patient.id === patientId ? {
      ...patient,
      records: { ...(patient.records || {}), medications: [...(patient.records?.medications || []), created] },
    } : patient) }));
    return created;
  };
  const updateMedication = (patientId, medicationId, changes) => {
    const updatedAt = new Date().toISOString();
    setData((current) => ({ ...current, patients: current.patients.map((patient) => patient.id === patientId ? {
      ...patient,
      records: { ...(patient.records || {}), medications: (patient.records?.medications || []).map((medication) => medication.id === medicationId ? {
        ...medication,
        ...changes,
        updatedAt,
        history: [...(medication.history || []), { id: crypto.randomUUID(), changedAt: updatedAt, previous: medication }],
      } : medication) },
    } : patient) }));
  };
  const addAllergy = (patientId, allergy) => {
    const createdAt = new Date().toISOString();
    const created = { ...allergy, id: crypto.randomUUID(), createdAt, updatedAt: createdAt, history: [], notes: [] };
    setData((current) => ({ ...current, patients: current.patients.map((patient) => patient.id === patientId ? {
      ...patient,
      records: { ...(patient.records || {}), allergies: [...(patient.records?.allergies || []), created] },
    } : patient) }));
    return created;
  };
  const updateAllergy = (patientId, allergyId, changes) => {
    const updatedAt = new Date().toISOString();
    setData((current) => ({ ...current, patients: current.patients.map((patient) => patient.id === patientId ? {
      ...patient,
      records: { ...(patient.records || {}), allergies: (patient.records?.allergies || []).map((allergy) => allergy.id === allergyId ? { ...allergy, ...changes, updatedAt, history: [...(allergy.history || []), { id: crypto.randomUUID(), changedAt: updatedAt, previous: allergy }] } : allergy) },
    } : patient) }));
  };
  const addAllergyNote = (patientId, allergyId, note) => {
    const createdAt = new Date().toISOString();
    setData((current) => ({ ...current, patients: current.patients.map((patient) => patient.id === patientId ? {
      ...patient,
      records: { ...(patient.records || {}), allergies: (patient.records?.allergies || []).map((allergy) => allergy.id === allergyId ? { ...allergy, updatedAt: createdAt, notes: [...(allergy.notes || []), { ...note, id: crypto.randomUUID(), createdAt }] } : allergy) },
    } : patient) }));
  };
  const addRecord = (patientId, key, record) => {
    const createdAt = new Date().toISOString();
    const created = { ...record, id: crypto.randomUUID(), createdAt, updatedAt: createdAt, history: [] };
    setData((current) => ({ ...current, patients: current.patients.map((patient) => patient.id === patientId ? { ...patient, records: { ...(patient.records || {}), [key]: [...(patient.records?.[key] || []), created] } } : patient) }));
    return created;
  };
  const updateRecord = (patientId, key, recordId, changes) => {
    const updatedAt = new Date().toISOString();
    setData((current) => ({ ...current, patients: current.patients.map((patient) => patient.id === patientId ? { ...patient, records: { ...(patient.records || {}), [key]: (patient.records?.[key] || []).map((record) => record.id === recordId ? { ...record, ...changes, updatedAt, history: [...(record.history || []), { id: crypto.randomUUID(), changedAt: updatedAt, previous: record }] } : record) } } : patient) }));
  };
  const addLab = (patientId, record) => addRecord(patientId, "labs", record);
  const updateLab = (patientId, recordId, changes) => updateRecord(patientId, "labs", recordId, changes);
  const addVaccination = (patientId, record) => addRecord(patientId, "vaccinations", record);
  const updateVaccination = (patientId, recordId, changes) => updateRecord(patientId, "vaccinations", recordId, changes);
  const updateAppointment = (id, change) => setData((current) => ({ ...current, appointments: current.appointments.map((item) => item.id === id ? { ...item, ...(typeof change === "string" ? { status: change } : change) } : item) }));
  const updateReferral = (id, change) => setData((current) => ({
    ...current,
    referrals: current.referrals.map((item) => item.id === id ? { ...item, ...(typeof change === "string" ? { status: change } : change) } : item),
  }));
  const addStaff = (staff) => {
    const created = { ...staff, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: staff.status || "PENDING" };
    setData((current) => ({ ...current, staff: [...current.staff, created] }));
    return created;
  };
  const updateStaff = (id, change) => setData((current) => ({ ...current, staff: current.staff.map((item) => item.id === id ? { ...item, ...change } : item) }));
  const removeStaff = (id) => setData((current) => ({ ...current, staff: current.staff.filter((item) => item.id !== id) }));
  const sendMessage = (message) => setData((current) => ({ ...current, messages: [...current.messages, { ...message, id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: true }] }));
  const updateNotification = (id, change) => setData((current) => ({ ...current, notifications: current.notifications.map((item) => item.id === id ? { ...item, ...change } : item) }));
  const deleteNotification = (id) => setData((current) => ({ ...current, notifications: current.notifications.filter((item) => item.id !== id) }));
  const updateFacility = (change) => setData((current) => ({ ...current, facility: { ...current.facility, ...change } }));
  const updateHospitalSettings = (change) => setData((current) => ({ ...current, settings: { ...current.settings, ...change } }));
  return { data, addAppointment, addPatient, addVisit, addHealthCondition, updateHealthCondition, addConditionNote, addMedication, updateMedication, addAllergy, updateAllergy, addAllergyNote, addLab, updateLab, addVaccination, updateVaccination, updateAppointment, updateReferral, addStaff, updateStaff, removeStaff, sendMessage, updateNotification, deleteNotification, updateFacility, updateHospitalSettings };
}

export function formatTime(value) { return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
export function formatDate(value) { return new Date(value).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" }); }
