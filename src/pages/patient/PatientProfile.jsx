import { useEffect, useState } from "react";
import { hospitalApi } from "../../hospitalApi";
import HospitalChrome from "../HospitalChrome";

const recordDefinitions = [
  ["Visit Logs", "View all recent clinical visits", "visitLogs", "visit-logs"],
  ["Health Conditions", "Check recorded health conditions", "conditions", "health-conditions"],
  ["Medication", "See prescribed and active medications", "medications", "medications"],
  ["Lab/Imaging Result", "Access lab and imaging reports", "labs", "lab-records"],
  ["Vaccination", "Track vaccines and immunization history", "vaccinations", "vaccinations"],
  ["Surgical History", "View details of surgeries", "surgeries", "surgical-records"],
  ["Other Document", "View uploaded health documents", "documents", "other-documents"],
  ["Emergency Contact", "View patient contacts", "contacts", "emergency-contacts"]
];

const ageFromDate = (value) => {
  if (!value) return "—";
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
};

export default function PatientProfile({ go }) {
  const id = sessionStorage.getItem("selectedPatientId");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    if (!id) { setError("No patient was selected."); setLoading(false); return () => {}; }
    hospitalApi.getPatient(id)
      .then((result) => { if (live) setPatient(result.patient); })
      .catch((reason) => { if (live) setError(reason.message); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [id]);

  if (loading) return <HospitalChrome title="Patient Profile" active="patients" go={go}><div className="patient-empty"><p>Loading patient…</p></div></HospitalChrome>;
  if (!patient || error) return <HospitalChrome title="Patient Profile" active="patients" go={go}><div className="patient-empty"><h3>Patient unavailable</h3><p>{error || "Patient not found."}</p><button onClick={() => go("patients")}>Back to patients</button></div></HospitalChrome>;

  const records = patient.records || {};
  const recordCount = Object.values(records).reduce((total, entries) => total + (Array.isArray(entries) ? entries.length : 0), 0);
  return <HospitalChrome title="←  Patient Profile" active="patients" go={go}><div className="profile-page"><section className="profile-hero"><div className="profile-name"><i>{patient.name?.[0] || "P"}</i><h2>{patient.name}<small>{patient.phone || "No phone provided"}</small></h2><button onClick={() => go("home")}>Schedule Appointment</button></div><div className="profile-facts">{[["Age",ageFromDate(patient.dateOfBirth)],["Gender",patient.gender||"—"],["Date of Birth",patient.dateOfBirth?new Date(patient.dateOfBirth).toLocaleDateString():"—"],["Record Number",patient.medicalRecordNumber||"—"],["Account",patient.claimed?"Claimed":"Invite pending"],["Status",patient.status?.replaceAll("_"," ")||"—"]].map(([label,value])=><span key={label}>{label}<b>{value}</b></span>)}</div><div className="profile-summary"><article><h3>Patient Details</h3><p>Phone Number <b>{patient.phone||"Not provided"}</b></p><p>Email <b>{patient.email||"Not provided"}</b></p></article><article><h3>Summary</h3><p>Recorded items <b>{recordCount}</b></p><p>Facility access <b>{patient.status==="ACTIVE"?"Active":"Pending patient claim"}</b></p></article></div></section><h2 className="profile-section-title">Upcoming Appointments</h2><div className="no-upcoming"><span>▣</span><h3>No Upcoming Appointment</h3><p>No facility appointment is currently linked to this patient.</p></div><h2 className="profile-section-title">Patient Record</h2><div className="record-grid">{recordDefinitions.map(([title,text,key,route],index)=>{const count=Array.isArray(records[key])?records[key].length:0;return <button key={title} onClick={()=>go(route)}><i>{["♙","♡","◇","♧","⚕","⊙","▤","♙"][index]}</i><b>{title}</b><span>{text}</span><small>{count} {title==="Emergency Contact"?"Contacts":"Files"}</small></button>})}</div></div></HospitalChrome>;
}
