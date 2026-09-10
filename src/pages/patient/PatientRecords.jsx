import { useState } from "react";
import HospitalChrome from "../HospitalChrome";
import { useHospitalData } from "../hospitalData";

const CONFIG = {
  conditions: {
    title: "Health Condition",
    statTitle: "Health Condition Stat",
    buckets: ["Active", "Managed", "Resolved"],
    totalLabel: "Number of Condition",
    emptyTitle: "No Health Conditions Added Yet",
    emptyText: "Patient does not have any condition added at the moment.",
    idLabel: "Condition ID",
    dateLabel: "Date Diagnosed",
    ownerLabel: "Diagnosed by",
  },
  medications: {
    title: "Medication",
    statTitle: "Medication Stat",
    buckets: ["Active", "Completed"],
    totalLabel: "Total",
    emptyTitle: "No Medications Recorded",
    emptyText: "There are no prescribed or active medications recorded for this patient.",
    idLabel: "Medication ID",
    dateLabel: "Date Issued",
    ownerLabel: "Prescribed by",
  },
  labs: {
    title: "Lab & Imaging Records",
    statTitle: "Lab/Imaging Records Stat",
    buckets: ["Pending", "Completed"],
    totalLabel: "Total",
    emptyTitle: "No Lab Record Added Yet",
    emptyText: "No lab or imaging reports have been recorded.",
    idLabel: "Test ID",
    dateLabel: "Date Conducted",
    ownerLabel: "Uploaded by",
  },
  vaccinations: {
    title: "Vaccination",
    statTitle: "Vaccination Stat",
    buckets: ["Pending", "Completed"],
    totalLabel: "Total",
    emptyTitle: "No Vaccination Records Found",
    emptyText: "Patient does not have any vaccination or immunization records documented.",
    idLabel: "Vaccination ID",
    dateLabel: "Date Given",
    ownerLabel: "Uploaded by",
  },
  surgeries: {
    title: "Surgical Record",
    statTitle: "Surgical Record",
    buckets: ["Ongoing Recovery", "Recovered", "Pending Document"],
    totalLabel: "Total",
    emptyTitle: "No Surgical History Recorded",
    emptyText: "No surgical procedures documented for this patient.",
    idLabel: "Surgery ID",
    dateLabel: "Surgery Date",
    ownerLabel: "Lead Surgeon",
  },
};

const cleanStatus = (value = "") => value.toLowerCase().replace(/\s+/g, "-");
const displayDate = (value) => value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function PatientRecords({ type, go }) {
  const config = CONFIG[type];
  const { data } = useHospitalData();
  const patientId = sessionStorage.getItem("selectedPatientId");
  const patient = data.patients.find((item) => item.id === patientId) || data.patients[0];
  const records = Array.isArray(patient?.records?.[type]) ? patient.records[type] : [];
  const [selected, setSelected] = useState(null);
  const [requested, setRequested] = useState(false);
  const patientName = patient?.name || [patient?.firstName, patient?.lastName].filter(Boolean).join(" ") || "Patient";
  const counters = config.buckets.map((status) => records.filter((record) => {
    const values = [record.status, record.outcome, record.documentStatus].filter(Boolean).join(" ").toLowerCase();
    return status === "Pending Document" ? String(record.documentStatus).toLowerCase().includes("pending") : values.includes(status.toLowerCase());
  }).length);

  return <HospitalChrome title={`←  ${config.title}`} active="patients" go={go}>
    <main className="records-page">
      <section className="record-stats">
        <h2>{config.statTitle}</h2>
        <div className="record-stat-grid">
          <article><span>{config.totalLabel}</span><strong>{records.length}</strong></article>
          {config.buckets.map((status, index) => <article key={status}><span>{status}</span><strong>{counters[index]}</strong></article>)}
        </div>
      </section>

      {type !== "labs" && records.length > 0 && <p className="privacy-note">ⓘ Full details can only be seen by authorized doctors and the patient.</p>}

      {records.length === 0 ? <section className="records-empty">
        <span className="empty-record-icon"><i /><i /><i /></span>
        <h2>{config.emptyTitle}</h2><p>{config.emptyText}</p>
      </section> : <section className="records-list">
        {records.map((record, index) => <button className="record-card" key={record.id || index} onClick={() => setSelected(record)}>
          <h3>{config.idLabel}: #{record.id || `${type.slice(0, 2).toUpperCase()}-${String(index + 1).padStart(4, "0")}`}</h3>
          <div><span>Status</span><b className={`record-status ${cleanStatus(record.status)}`}>{record.status || "Pending"}</b></div>
          <div><span>{config.dateLabel}</span><b>{displayDate(record.date || record.dateIssued || record.dateDiagnosed || record.dateConducted)}</b></div>
          <div><span>Last Updated</span><b>{displayDate(record.updatedAt)}</b></div>
          {type === "labs" && <div><span>Lab Scientist</span><b>{record.labScientist || "—"}</b></div>}
          {type === "vaccinations" && <div><span>Administered by</span><b>{record.administeredBy || "—"}</b></div>}
          {type === "surgeries" && <><div><span>Outcome</span><b className={`record-status ${cleanStatus(record.outcome)}`}>{record.outcome || "—"}</b></div><div><span>Surgery Document</span><b className={`record-status ${cleanStatus(record.documentStatus)}`}>{record.documentStatus || "—"}</b></div></>}
          <div><span>{config.ownerLabel}</span><b>{record.owner || record.clinician || "—"}</b></div>
        </button>)}
      </section>}
    </main>

    {selected && <div className="screen-overlay" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
      <section className="record-detail">
        <header><button onClick={() => setSelected(null)} aria-label="Close details">←</button><h2>{type === "conditions" ? "Health Condition Details" : type === "medications" ? "Medication Details" : type === "labs" ? "Lab & Imaging Records" : config.title}</h2></header>
        <div className="record-patient"><small>Patient</small><strong>{patientName}</strong><span>Hospital ID: {patient?.id?.slice(0, 8) || "—"}</span></div>
        <div className="record-detail-body">
          <p><span>Status</span><b className={`record-status ${cleanStatus(selected.status)}`}>{selected.status || "Pending"}</b></p>
          <p><span>{config.idLabel}</span><b>#{selected.id || "—"}</b></p>
          <p><span>{config.dateLabel}</span><b>{displayDate(selected.date || selected.dateIssued || selected.dateDiagnosed || selected.dateConducted)}</b></p>
          <p><span>Last Updated</span><b>{displayDate(selected.updatedAt)}</b></p>
          {type === "labs" && <p><span>Lab Scientist</span><b>{selected.labScientist || "—"}</b></p>}
          {type === "vaccinations" && <p><span>Administered by</span><b>{selected.administeredBy || "—"}</b></p>}
          {type === "surgeries" && <><p><span>Outcome</span><b className={`record-status ${cleanStatus(selected.outcome)}`}>{selected.outcome || "—"}</b></p><p><span>Surgery Document</span><b className={`record-status ${cleanStatus(selected.documentStatus)}`}>{selected.documentStatus || "—"}</b></p><p><span>Uploaded by</span><b>{selected.uploadedBy || "—"}</b></p></>}
          <p><span>{config.ownerLabel}</span><b>{selected.owner || selected.clinician || "—"}</b></p>
        </div>
        {type === "surgeries" && (selected.coSurgeon || selected.nurse) && <><h3 className="record-subtitle">Surgical Assistant</h3><div className="record-detail-body"><p><span>Co Surgeon</span><b>{selected.coSurgeon || "—"}</b></p><p><span>Nurse</span><b>{selected.nurse || "—"}</b></p></div></>}
        <button className="record-primary" onClick={() => setRequested(true)}>Request Update</button>
        {(type === "conditions" || type === "surgeries") && <button className="record-secondary">Add Internal Note for Doctor</button>}
      </section>
    </div>}

    {requested && <div className="screen-overlay" role="dialog" aria-modal="true"><section className="result-dialog"><span>✓</span><h2>Request Sent</h2><p>Your record update request has been successfully sent.</p><button onClick={() => { setRequested(false); setSelected(null); }}>Done</button></section></div>}
  </HospitalChrome>;
}
