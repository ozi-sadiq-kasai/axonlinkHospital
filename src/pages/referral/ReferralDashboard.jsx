import { useEffect, useMemo, useState } from "react";
import HospitalChrome from "../HospitalChrome";
import { formatDate, formatTime } from "../hospitalData";
import { hospitalApi } from "../../hospitalApi";

const tabs = ["internal", "incoming", "outgoing"];
const pendingStatuses = new Set(["PENDING", "PENDING_REQUEST", "REQUESTED"]);
const normalize = (value) => String(value || "").trim().toUpperCase().replace(/[ -]+/g, "_");
const patientName = (item) => item.patientName || item.patient?.name || item.patient || "Patient name not recorded";
const patientImage = (item) => item.patientImage || item.patient?.image || item.patient?.avatar;

function Empty({ tab }) {
  return <section className="referral-empty"><span className="referral-empty-icon"><svg viewBox="0 0 64 64"><path d="M19 10h20l9 9v35H19z"/><path d="M39 10v10h10M27 30h14M27 38h14M27 46h9"/></svg></span><h2>No {tab} referrals yet</h2><p>{tab === "internal" ? "Referrals between clinicians in your facility will appear here." : `${tab[0].toUpperCase() + tab.slice(1)} referral requests will appear here.`}</p></section>;
}

function Person({ item, incoming }) {
  const name = patientName(item);
  const image = patientImage(item);
  const detail = incoming ? item.referralId || item.reference || "Referral ID not recorded" : [item.patientGender || item.patient?.gender, item.patientAge || item.patient?.age].filter(Boolean).join(" · ") || "Patient details not recorded";
  return <div className="referral-person">{image ? <img src={image} alt=""/> : <i>{name === "Patient name not recorded" ? "?" : name[0]}</i>}<span><strong>{name}</strong><small>{detail}</small></span></div>;
}

function Card({ item, tab, pending, openDetails, cancel, accept, decline, assign, priority, reminder, reschedule }) {
  const [menu, setMenu] = useState(false);
  const status = normalize(item.status) || "PENDING";
  const date = item.appointmentAt || item.scheduledAt || item.date || item.createdAt;
  const incoming = tab === "incoming";
  const from = item.fromName || item.from?.name || item.referringClinician || "Not recorded";
  const to = item.toName || item.to?.name || item.receivingClinician || item.referredTo || "Not recorded";
  return <article className="referral-card" onClick={() => openDetails(item)}>
    <header><Person item={item} incoming={incoming}/><div className="referral-card-actions">{!pending && <span className={`referral-status ${status.toLowerCase()}`}>{status.replaceAll("_", " ")}</span>}<button className="referral-more" type="button" aria-label="More referral options" onClick={(event) => { event.stopPropagation(); setMenu(!menu); }}>•••</button>{menu && <div className="referral-more-menu">{incoming ? <button type="button" onClick={(event) => { event.stopPropagation(); setMenu(false); reschedule(item); }}>Accept and Reschedule</button> : <><button type="button" onClick={(event) => { event.stopPropagation(); setMenu(false); priority(item); }}>Change Priority</button><button type="button" onClick={(event) => { event.stopPropagation(); setMenu(false); reminder(item); }}>Send Reminder</button></>}</div>}</div></header>
    {pending && date && <div className="referral-time"><b>{formatDate(date)}</b><span/><b>{formatTime(date)}</b></div>}
    <div className="referral-reason"><small>Reason for Referral</small><p>{item.reason || item.referralReason || "No referral reason recorded."}</p></div>
    {incoming ? <div className="referred-by"><small>Referred by</small><strong>{from}</strong><span>{item.fromFacility?.name || item.facilityName || item.referringFacility?.name || "Facility not recorded"}</span></div> : <dl><div><dt>From</dt><dd>{from}</dd></div><div><dt>To</dt><dd><button className="referral-assignee" type="button" onClick={(event) => { event.stopPropagation(); assign(item); }}>{to}<span>›</span></button></dd></div></dl>}
    {pending && incoming && <footer className="incoming-actions"><button type="button" onClick={(event) => { event.stopPropagation(); accept(item); }}>Accept</button><button type="button" onClick={(event) => { event.stopPropagation(); decline(item.id); }}>Decline</button></footer>}
    {pending && !incoming && <button className="referral-cancel" type="button" onClick={(event) => { event.stopPropagation(); cancel(item.id); }}>Cancel</button>}
  </article>;
}

function Modal({ children, close, className = "" }) {
  return <div className="referral-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><section className={`referral-modal ${className}`} role="dialog" aria-modal="true"><button className="referral-modal-close" type="button" onClick={close}>×</button>{children}</section></div>;
}

function DoctorModal({ item, doctors, accepting, close, save }) {
  const currentId = item.toId || item.assignedDoctorId || item.to?.id || "";
  const [id, setId] = useState(accepting ? "" : currentId);
  return <Modal close={close} className="assign-modal"><header><h2>{accepting ? "Accept Referral Request" : "Assign Another Doctor"}</h2><p>{accepting ? "You are about to accept a referral. Please assign a doctor to the patient." : "Switch the patient over to another doctor."}</p></header><div className="assignment-patient">{patientImage(item) ? <img src={patientImage(item)} alt=""/> : <i>{patientName(item)[0]}</i>}<span><strong>{patientName(item)}</strong><small>Patient</small></span></div>{!accepting && <p className="current-assignee">Previously assigned: <strong>{item.toName || item.to?.name || item.receivingClinician || "Not assigned"}</strong></p>}<label>{accepting ? "Assign Doctor" : "Select New Doctor"}<select value={id} onChange={(event) => setId(event.target.value)}><option value="">{doctors.length ? "Select Doctor" : "No doctors available"}</option>{doctors.filter((doctor) => accepting || doctor.id !== currentId).map((doctor) => <option value={doctor.id} key={doctor.id}>{doctor.name}{doctor.specialty ? ` — ${doctor.specialty}` : ""}</option>)}</select></label><footer><button type="button" onClick={close}>Cancel</button><button type="button" disabled={!id || (!accepting && id === currentId)} onClick={() => save(doctors.find((doctor) => doctor.id === id))}>{accepting ? "Confirm" : "Save Change"}</button></footer></Modal>;
}

function PriorityModal({ item, close, save }) {
  const [value, setValue] = useState(item.priority || "URGENT");
  return <Modal close={close} className="priority-modal"><header><h2>Change Priority</h2><p>Adjust the priority level for this patient.</p></header><label>Select Priority<select value={value} onChange={(event) => setValue(event.target.value)}>{["ROUTINE", "NORMAL", "HIGH", "URGENT", "EMERGENCY"].map((option) => <option key={option}>{option}</option>)}</select></label><footer><button onClick={close}>Cancel</button><button onClick={() => save(value)}>Save Change</button></footer></Modal>;
}

export default function ReferralDashboard({ go }) {
  const [data,setData]=useState({referrals:[],staff:[]});const[loading,setLoading]=useState(true);const[loadError,setLoadError]=useState("");
  useEffect(()=>{let live=true;Promise.all([hospitalApi.listReferrals(),hospitalApi.appointmentOptions()]).then(([referrals,options])=>{if(live)setData({referrals:(referrals.referrals||[]).map(item=>({...item,type:item.direction,fromName:item.fromClinician,toName:item.toClinician,fromFacility:item.sendingFacility,appointmentAt:item.appointment?.date})),staff:(options.clinicians||[]).map(item=>({...item,id:item.membershipId,specialty:item.jobTitle}))})}).catch(reason=>{if(live)setLoadError(reason.message)}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[]);
  const updateReferral=async(id,change)=>{const status=typeof change==="string"?change:change?.status,action={ACCEPTED:"accept",DECLINED:"decline",CANCELED:"cancel",CANCELLED:"cancel",COMPLETED:"complete"}[normalize(status)];if(!action)return;try{const{referral:item}=await hospitalApi.updateReferral(id,action);setData(current=>({...current,referrals:current.referrals.map(existing=>existing.id===id?{...existing,...item,type:item.direction,fromName:item.fromClinician,toName:item.toClinician,fromFacility:item.sendingFacility,appointmentAt:item.appointment?.date}:existing)}))}catch(reason){setNotice(reason.message)}};
  const [tab, setTab] = useState("internal");
  const [range, setRange] = useState("7");
  const [filter, setFilter] = useState("ALL");
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState("");
  const doctors = useMemo(() => data.staff.filter((person) => ["DOCTOR", "GENERALIST", "SPECIALIST", "CLINICIAN"].includes(normalize(person.role))), [data.staff]);
  const referrals = useMemo(() => data.referrals.filter((item) => normalize(item.type || item.direction || "INTERNAL") === tab.toUpperCase()), [data.referrals, tab]);
  const ranged = useMemo(() => referrals.filter((item) => { if (range === "ALL") return true; const raw = item.createdAt || item.date || item.appointmentAt || item.scheduledAt; if (!raw) return true; const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - Number(range)); return new Date(raw) >= cutoff; }), [referrals, range]);
  const pending = ranged.filter((item) => pendingStatuses.has(normalize(item.status)));
  const history = ranged.filter((item) => !pendingStatuses.has(normalize(item.status)) && (filter === "ALL" || normalize(item.status) === filter));
  const count = (...statuses) => ranged.filter((item) => statuses.includes(normalize(item.status))).length;
  if(loading)return <HospitalChrome title="Referrals" active="referrals" go={go}><main className="referral-page"><section className="referral-empty"><h2>Loading referrals</h2><p>Retrieving this facility's referrals.</p></section></main></HospitalChrome>;
  if(loadError)return <HospitalChrome title="Referrals" active="referrals" go={go}><main className="referral-page"><section className="referral-empty"><h2>Unable to load referrals</h2><p>{loadError}</p></section></main></HospitalChrome>;
  const incoming = tab === "incoming";
  const stats = incoming ? [["Total Referrals", ranged.length], ["Total Referral Requests", ranged.length], ["Pending Referrals", pending.length], ["Accepted Referrals", count("ACCEPTED")], ["Multi-Referral", count("MULTI_REFERRAL")], ["Declined", count("DECLINED")]] : [[`Total ${tab[0].toUpperCase() + tab.slice(1)} Referrals`, ranged.length], ["Pending Request", pending.length], ["Accepted", count("ACCEPTED")], ["Multi-Referral", count("MULTI_REFERRAL")], ["Canceled", count("CANCELED", "CANCELLED")]];
  const openDetails = (item) => { sessionStorage.setItem("selectedReferralId", item.id); go("referral-details"); };
  const unavailable = () => { setNotice("This action is not available for shared referrals yet."); window.setTimeout(() => setNotice(""), 2500); };
  const actions = { openDetails, cancel: (id) => updateReferral(id, "CANCELED"), decline: (id) => updateReferral(id, { status: "DECLINED" }), accept: (item) => updateReferral(item.id, { status: "ACCEPTED" }), assign: unavailable, priority: unavailable, reminder: unavailable, reschedule: (item) => { sessionStorage.setItem("selectedReferralId", item.id); go("referral-details"); } };

  return <HospitalChrome title="Referrals" active="referrals" go={go}><main className="referral-page"><nav className="referral-tabs">{tabs.map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item[0].toUpperCase() + item.slice(1)}</button>)}</nav><section className={`referral-summary ${incoming ? "six-stats" : ""}`}><header><h2>Summary Stat</h2><select value={range} onChange={(event) => setRange(event.target.value)}><option value="7">Last 7 Days</option><option value="30">Last 30 Days</option><option value="90">Last 90 Days</option><option value="ALL">All Time</option></select></header><div>{stats.map(([label, value]) => <article key={label}><span>{label}</span><b>{String(value).padStart(2, "0")}</b></article>)}</div></section>{ranged.length === 0 ? <Empty tab={tab}/> : <><section className="referral-pending"><header><h2>Pending Request</h2><span>{pending.length} request{pending.length === 1 ? "" : "s"}</span></header>{pending.length ? <div className="referral-grid">{pending.map((item) => <Card item={item} tab={tab} pending {...actions} key={item.id}/>)}</div> : <div className="referral-section-empty">No pending requests.</div>}</section><section className="referral-history"><header><div><h2>{incoming ? "Request History" : "Referral History"}</h2><small>{history.length} referral{history.length === 1 ? "" : "s"}</small></div><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">Filter by</option><option value="ACCEPTED">Accepted</option><option value="DECLINED">Declined</option><option value="CANCELED">Canceled</option><option value="MULTI_REFERRAL">Multi-Referral</option></select></header>{history.length ? <div className="referral-grid">{history.map((item) => <Card item={item} tab={tab} {...actions} key={item.id}/>)}</div> : <div className="referral-section-empty">No referrals match this filter.</div>}</section></>}{notice && <div className="referral-notice">{notice}</div>}{dialog?.type === "priority" && <PriorityModal item={dialog.item} close={() => setDialog(null)} save={(priority) => { updateReferral(dialog.item.id, { priority }); setDialog(null); }}/>} {dialog?.type === "assign" && <DoctorModal item={dialog.item} doctors={doctors} close={() => setDialog(null)} save={(doctor) => saveDoctor(doctor, false)}/>} {dialog?.type === "accept" && <DoctorModal item={dialog.item} doctors={doctors} accepting close={() => setDialog(null)} save={(doctor) => saveDoctor(doctor, true)}/>}</main></HospitalChrome>;
}
