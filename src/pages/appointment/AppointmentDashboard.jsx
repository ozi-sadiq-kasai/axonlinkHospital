import { useEffect, useMemo, useState } from "react";
import HospitalChrome from "../HospitalChrome";
import { formatDate, formatTime } from "../hospitalData";
import { hospitalApi } from "../../hospitalApi";
import PendingRequests from "./PendingRequests";

const dayKey = (value) => new Date(value).toDateString();
const Empty = ({ title, text }) => <div className="appointment-empty"><span>▣</span><h3>{title}</h3><p>{text}</p></div>;

export default function AppointmentDashboard({ go }) {
  const [appointmentsData,setAppointmentsData]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  useEffect(()=>{let live=true;hospitalApi.listAppointments().then(result=>{if(live)setAppointmentsData((result.appointments||[]).map(item=>({...item,start:item.date,end:item.date,type:item.visitType,status:item.status==="CONFIRMED"?"UPCOMING":item.status==="CANCELLED"?"CANCELED":item.status})))}).catch(reason=>{if(live)setError(reason.message)}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[]);
  const [tab, setTab] = useState("appointments");
  const [view, setView] = useState("schedule");
  const [filterOpen, setFilterOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const appointments = useMemo(() => [...appointmentsData].sort((a,b) => new Date(a.start)-new Date(b.start)), [appointmentsData]);
  const waiting = appointments.filter((item) => item.status === "WAITING");
  const upcoming = appointments.filter((item) => ["UPCOMING","PENDING"].includes(item.status));
  const concluded = appointments.filter((item) => ["COMPLETED","CANCELED","MISSED","NO_SHOW"].includes(item.status));
  const stats = [["Total",appointments.length],["Upcoming",upcoming.length],["Completed",appointments.filter(i=>i.status==="COMPLETED").length],["Canceled",appointments.filter(i=>i.status==="CANCELED").length],["Missed",appointments.filter(i=>["MISSED","NO_SHOW"].includes(i.status)).length]];
  const groups = Object.entries(appointments.reduce((result,item) => { const key=dayKey(item.start); (result[key] ||= []).push(item); return result; },{}));
  const openDetails = (item) => { sessionStorage.setItem("selectedAppointmentId", item.id); go("appointment-details"); };

  if(loading)return <HospitalChrome title="Appointment" active="appointments" go={go}><Empty title="Loading appointments" text="Retrieving the facility schedule."/></HospitalChrome>;
  if(error)return <HospitalChrome title="Appointment" active="appointments" go={go}><Empty title="Unable to load appointments" text={error}/></HospitalChrome>;
  return <HospitalChrome title="Appointment" active="appointments" go={go}><main className="appointment-page">
    <div className="appointment-tabs"><button className={tab==="appointments"?"active":""} onClick={()=>setTab("appointments")}>Appointments</button><button className={tab==="pending"?"active":""} onClick={()=>setTab("pending")}>Pending Request <b>{appointments.filter(i=>i.status==="PENDING").length}</b></button></div>
    {tab==="pending"?<PendingRequests appointments={appointmentsData} onChange={setAppointmentsData}/>:<>
    <section className="appointment-stats"><header><h2>Today’s Appointment Stat</h2><button onClick={()=>setFilterOpen(!filterOpen)}>{view[0].toUpperCase()+view.slice(1)}⌄</button>{filterOpen&&<div className="appointment-menu filter-menu">{["day","week","schedule"].map(item=><button key={item} onClick={()=>{setView(item);setFilterOpen(false)}}>{item[0].toUpperCase()+item.slice(1)}</button>)}</div>}</header><div>{stats.map(([label,value])=><article key={label}><span>{label}</span><b>{value}</b></article>)}</div></section>
    <section className="schedule-section"><h2>Scheduled Appointments</h2>{appointments.length===0?<Empty title="No scheduled appointments" text="Newly booked appointments will appear here."/>:view==="week"?<WeekBoard appointments={appointments} onOpen={openDetails}/>:<div className="schedule-list">{groups.map(([date,items])=><section key={date}><time>{new Date(date).toLocaleDateString([], {day:"2-digit",month:"short",weekday:"short"})}</time><div>{items.map(item=><button key={item.id} onClick={()=>setPreview(item)}><i className={item.status.toLowerCase()}/><span>{formatTime(item.start)} – {formatTime(item.end)}</span><b>{item.patient}</b><em>{item.clinician}</em></button>)}</div></section>)}</div>}</section>
    <section className="waiting-section"><header><h2>Waiting Room <b>{waiting.length}</b></h2></header>{waiting.length===0?<Empty title="Waiting room is empty" text="Patients checked in for consultation will appear here."/>:<div className="appointment-card-grid">{waiting.map(item=><AppointmentCard item={item} key={item.id} waiting onClick={()=>setPreview(item)}/>)}</div>}</section>
    <section className="appointment-subsection"><h2>Upcoming Appointments</h2>{upcoming.length===0?<Empty title="No upcoming appointments" text="Future appointments will appear here."/>:<div className="appointment-card-grid">{upcoming.slice(0,4).map(item=><AppointmentCard item={item} key={item.id} onClick={()=>setPreview(item)}/>)}</div>}</section>
    <section className="concluded-section"><h2>Concluded</h2>{concluded.length===0?<Empty title="No concluded appointments" text="Completed, canceled, and missed visits will appear here."/>:<div className="concluded-table"><header><span>Patient</span><span>Seen by</span><span>Date</span><span>Type</span><span>Status</span><span/></header>{concluded.map(item=><button key={item.id} onClick={()=>openDetails(item)}><b>{item.patient}</b><span>{item.clinician}</span><span>{formatDate(item.start)} {formatTime(item.start)}</span><span>{item.type||"Consultation"}</span><em className={item.status.toLowerCase()}>{item.status.replace("_","-")}</em><i>View Details</i></button>)}</div>}</section>
    </>}
  </main>{preview&&<AppointmentPreview item={preview} onClose={()=>setPreview(null)} onDetails={()=>openDetails(preview)}/>}</HospitalChrome>;
}

function AppointmentCard({ item, waiting, onClick }) { return <button className="appointment-card" onClick={onClick}><h3><i>{item.patient?.[0]}</i>{item.patient}<small>{item.type||"Follow-Up"}</small></h3>{waiting&&<em>{item.priority||"Urgent"}</em>}<p><span>{waiting?"Time Waiting":formatDate(item.start)}</span><b>{waiting?(item.waitingTime||"Just arrived"):formatTime(item.start)}</b></p><small>Assigned to</small><strong>{item.clinician||"Open to Available Doctor"}</strong></button> }
function AppointmentPreview({ item,onClose,onDetails }) { return <div className="screen-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="appointment-preview"><button className="preview-close" onClick={onClose}>×</button><i>{item.patient?.[0]}</i><h2>{item.patient}</h2><em className={item.status.toLowerCase()}>{item.status}</em><div><b>{formatDate(item.start)}</b><b>{formatTime(item.start)}</b></div><article><small>Type</small><strong>{item.type||"Follow-Up"}</strong><small>Visit Reason</small><p>{item.reason||"No visit reason recorded."}</p></article><p>Assigned to <b>{item.clinician||"Available doctor"}</b></p><button onClick={onDetails}>View Details</button></section></div> }
function WeekBoard({ appointments,onOpen }) { const base=new Date();const days=Array.from({length:7},(_,i)=>{const d=new Date(base);d.setDate(base.getDate()-base.getDay()+i);return d});return <div className="appointment-week"><header><span/>{days.map(d=><b key={d.toISOString()}>{d.toLocaleDateString([],{weekday:"short"})}<small>{d.getDate()}</small></b>)}</header>{[8,9,10,11,12,13].map(hour=><div key={hour}><time>{hour}:00</time>{days.map(day=><section key={day.toISOString()}>{appointments.filter(a=>dayKey(a.start)===dayKey(day)&&new Date(a.start).getHours()===hour).map(a=><button key={a.id} onClick={()=>onOpen(a)}>{a.patient}<small>{formatTime(a.start)}</small></button>)}</section>)}</div>)}</div> }
