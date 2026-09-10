import HospitalChrome from "../HospitalChrome";
import { useHospitalData } from "../hospitalData";

const Empty = ({ title, text }) => <section className="records-empty"><span className="empty-record-icon"><i /><i /><i /></span><h2>{title}</h2><p>{text}</p></section>;
const patientRecords = (data) => {
  const id = sessionStorage.getItem("selectedPatientId");
  const patient = data.patients.find((item) => item.id === id) || data.patients[0];
  return { patient, records: patient?.records || {} };
};

export function PatientDocuments({ go }) {
  const { data } = useHospitalData();
  const { records } = patientRecords(data);
  const documents = Array.isArray(records.documents) ? records.documents : [];
  return <HospitalChrome title="←  Other Documents" active="patients" go={go}><main className="records-page">
    <section className="document-stat"><span>Document</span><strong>{documents.length}</strong><i /><b>Total Documents</b></section>
    {documents.length === 0 ? <Empty title="No Documents Uploaded" text="No documents yet" /> : <section className="documents-grid">
      {documents.map((document, index) => <button className="document-card" key={document.id || index} onClick={() => document.url && window.open(document.url, "_blank", "noopener,noreferrer")}>
        <i>▤</i><h2>{document.name || "Patient Document"}</h2><p>{document.createdAt ? new Date(document.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Date not recorded"} <span>{document.type || "FILE"}</span></p><hr/><b>{document.uploadedBy || "Uploader not recorded"}</b>
      </button>)}
    </section>}
  </main></HospitalChrome>;
}

export function EmergencyContacts({ go }) {
  const { data } = useHospitalData();
  const { records } = patientRecords(data);
  const contacts = Array.isArray(records.contacts) ? records.contacts : [];
  return <HospitalChrome title="←  Emergency Contact" active="patients" go={go}><main className="records-page contacts-page">
    {contacts.length === 0 ? <Empty title="No Emergency Contact Added" text="Patient is yet to upload their emergency contact information" /> : contacts.map((contact, index) => <section className="contact-card" key={contact.id || index}>
      <span className="contact-type">{index === 0 ? "Primary Contact" : "Secondary Contact"}</span>
      <header><i>{contact.name?.[0] || "?"}</i><h2>{contact.name || "Contact"}<small>{contact.relationship || "Relationship not recorded"}</small></h2></header>
      <div className="contact-phones"><p><small>Phone</small><a href={`tel:${contact.phone || ""}`}>{contact.phone || "—"}</a></p>{contact.secondPhone && <p><small>Second Phone</small><a href={`tel:${contact.secondPhone}`}>{contact.secondPhone}</a></p>}</div>
      {contact.email && <p className="contact-line"><small>Email Address</small><a href={`mailto:${contact.email}`}>{contact.email}</a></p>}
      <p className="contact-line"><small>Address</small><span>{contact.address || "—"}</span>{contact.address && <a className="maps-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`} target="_blank" rel="noreferrer">Open in Maps</a>}</p>
    </section>)}
  </main></HospitalChrome>;
}
