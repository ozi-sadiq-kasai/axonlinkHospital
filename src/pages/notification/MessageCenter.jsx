import { useMemo, useState } from "react";
import HospitalChrome from "../HospitalChrome";
import { useFacilityStaff } from "../home/useFacilityOperations";

const Avatar = ({ person }) => person?.image || person?.avatar
  ? <img src={person.image || person.avatar} alt="" />
  : <i>{person?.name?.[0] || "?"}</i>;

export default function MessageCenter({ go }) {
  const { staff, loading, error } = useFacilityStaff();
  const [query, setQuery] = useState("");
  const visible = useMemo(() => staff.filter((item) => item.name?.toLowerCase().includes(query.toLowerCase())), [staff, query]);
  return <HospitalChrome title="Message" active="messages" go={go}>
    <main className="message-page">
      <aside className="message-contacts">
        <header><h2>Staff Members</h2><small>All ({staff.length}) staff members</small></header>
        <label>⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by Name" /></label>
        {loading ? <section className="message-empty small"><p>Loading staff…</p></section>
          : error ? <section className="message-empty small"><h3>Unable to load staff</h3><p>{error}</p></section>
          : visible.length ? <div>{visible.map((item) => <article key={item.id}><Avatar person={item} /><span><b>{item.name || "Name not recorded"}</b><small>{item.role || "Role not recorded"}</small></span></article>)}</div>
          : <section className="message-empty small"><i>♙</i><h3>{staff.length ? "No staff found" : "No staff members"}</h3><p>{staff.length ? "Try another name." : "Staff members will appear here after joining the facility."}</p></section>}
      </aside>
      <section className="conversation"><section className="message-empty"><i>▰</i><h3>Facility messaging is not enabled</h3><p>Clinical conversations remain clinician-to-clinician. A secure facility messaging participant model must be enabled before Hospital accounts can send messages.</p></section></section>
    </main>
  </HospitalChrome>;
}
