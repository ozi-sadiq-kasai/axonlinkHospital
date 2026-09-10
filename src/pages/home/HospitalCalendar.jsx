import { useMemo, useState } from "react";
import HospitalChrome from "../HospitalChrome";
import { formatTime, useHospitalData } from "../hospitalData";

const dayStart = (date) => { const copy = new Date(date); copy.setHours(0,0,0,0); return copy; };
const sameDay = (a,b) => dayStart(a).getTime() === dayStart(b).getTime();
export default function HospitalCalendar({ go }) {
  const { data } = useHospitalData(); const [view,setView] = useState("day"); const [cursor,setCursor] = useState(new Date());
  const days = useMemo(() => view === "day" ? [cursor] : Array.from({length:7},(_,i) => { const d = new Date(cursor); d.setDate(cursor.getDate() - cursor.getDay() + i); return d; }), [view,cursor]);
  const visible = data.appointments.filter((item) => days.some((day) => sameDay(new Date(item.start),day)));
  const move = (direction) => { const next = new Date(cursor); next.setDate(cursor.getDate() + direction * (view === "day" ? 1 : 7)); setCursor(next); };
  const hours = Array.from({length:12},(_,i) => i + 7);
  return <HospitalChrome title="Calendar" active="calendar" go={go}><div className="calendar-page"><header><div><h2>{cursor.toLocaleDateString([], {month:"long",year:"numeric"}).toUpperCase()}</h2><button onClick={() => setCursor(new Date())}>Today {new Date().getDate()} {new Date().toLocaleDateString([], {month:"short"})}</button></div><nav><button onClick={() => move(-1)}>‹</button><button onClick={() => move(1)}>›</button><select value={view} onChange={(event) => setView(event.target.value)}><option value="day">Day</option><option value="week">Week</option></select></nav></header><div className={`calendar-grid ${view}`}><div className="calendar-days"><span />{days.map((day) => <b className={sameDay(day,new Date()) ? "today" : ""} key={day.toISOString()}>{day.toLocaleDateString([], {weekday:"short"})}<small>{day.getDate()}</small></b>)}</div><div className="calendar-body">{hours.map((hour) => <div className="calendar-hour" key={hour}><time>{String(hour).padStart(2,"0")}:00</time>{days.map((day) => <div className="calendar-cell" key={day.toISOString()}>{visible.filter((item) => sameDay(new Date(item.start),day) && new Date(item.start).getHours() === hour).map((item,index) => <article className={`calendar-event color-${index%3}`} key={item.id}><b>{item.patient}</b><span>{formatTime(item.start)} – {formatTime(item.end)}</span><small>{item.clinician}</small></article>)}</div>)}</div>)}</div>{!visible.length && <div className="calendar-empty"><span>▣</span><h3>No appointments scheduled</h3><p>Appointments added from Home will appear in this {view} view.</p><button onClick={() => go("home")}>Go to Home</button></div>}</div></div></HospitalChrome>;
}
