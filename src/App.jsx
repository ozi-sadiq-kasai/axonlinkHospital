import React, { useEffect, useRef, useState } from "react";
import FacilitySignIn from "./pages/authentication/FacilitySignIn";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import ResetCodePage from "./pages/authentication/ResetCode";
import CreateNewPassword from "./pages/authentication/CreateNewPassword";
import PasswordResetSuccess from "./pages/authentication/PasswordResetSuccess";
import { hospitalApi } from "./hospitalApi";
import FacilityStaffInvitation from "./pages/authentication/FacilityStaffInvitation";
import HospitalHome from "./pages/home/HospitalHome";
import HospitalCalendar from "./pages/home/HospitalCalendar";
import Patients from "./pages/patient/Patients";
import AddPatient from "./pages/patient/AddPatient";
import PatientProfile from "./pages/patient/PatientProfile";
import VisitLogs from "./pages/patient/VisitLogs";
import PatientRecords from "./pages/patient/PatientRecords";
import { EmergencyContacts, PatientDocuments } from "./pages/patient/PatientAdditionalRecords";
import AppointmentDashboard from "./pages/appointment/AppointmentDashboard";
import AppointmentDetails from "./pages/appointment/AppointmentDetails";
import ReferralDashboard from "./pages/referral/ReferralDashboard";
import ReferralDetails from "./pages/referral/ReferralDetails";
import StaffManagement from "./pages/staffManagement/StaffManagement";
import AddStaff from "./pages/staffManagement/AddStaff";
import StaffProfile from "./pages/staffManagement/StaffProfile";
import ActivityLog from "./pages/activityLog/ActivityLog";
import MessageCenter from "./pages/notification/MessageCenter";
import NotificationCenter from "./pages/notification/NotificationCenter";
import Settings from "./pages/setting/profile/Settings";
import AnalysisDashboard from "./pages/analysis/AnalysisDashboard";

const purple = "#574ba7";

function ShieldArtwork({ kind = "lock" }) {
  return (
    <svg className="artwork" viewBox="0 0 620 620" role="img" aria-label={kind === "lock" ? "Secure password illustration" : "Facility document verification illustration"}>
      <ellipse cx="320" cy="480" rx="175" ry="52" fill="#1f1a45" opacity=".35" />
      {kind === "lock" ? <>
        <path d="M225 272v-58c0-74 47-119 101-119s100 44 100 119v45" fill="none" stroke="#17142f" strokeWidth="42" strokeLinecap="round" />
        <path d="M186 244 345 184l102 57v203L271 514l-85-45Z" fill="#5449a0" stroke="#1b1739" strokeWidth="5" />
        <path d="m345 184 102 57-176 69-85-66Z" fill="#7169b4" />
        <circle cx="333" cy="352" r="22" fill="#17142f" /><path d="m319 363-7 58 30-10 4-59Z" fill="#17142f" />
        <g transform="translate(92 200) rotate(-30)"><rect width="126" height="65" rx="9" fill="#acd5e5" stroke="#242043" strokeWidth="4" /><text x="63" y="49" textAnchor="middle" fontSize="42" fontWeight="700" fill="#23223a">**</text></g>
        <g transform="translate(405 322) rotate(-28)"><rect width="137" height="69" rx="9" fill="#a2d582" stroke="#242043" strokeWidth="4" /><text x="68" y="51" textAnchor="middle" fontSize="40" fontWeight="700" fill="#30382d">**</text></g>
        <g transform="translate(164 411) rotate(-27)"><rect width="63" height="61" rx="9" fill="#e7a524" stroke="#242043" strokeWidth="4" /><text x="32" y="48" textAnchor="middle" fontSize="40" fontWeight="700" fill="#44301b">*</text></g>
      </> : <>
        <path d="m125 321 107-62 191 39 61 82-201 139-131-64Z" fill="#51469b" stroke="#1d193c" strokeWidth="5" />
        <path d="m152 302 114 55 165-102 53 125-201 76-131-64Z" fill="#6156aa" stroke="#1d193c" strokeWidth="5" />
        <path d="M195 91h164v267H195z" fill="#eeedf7" stroke="#2b2651" strokeWidth="5" transform="rotate(-3 277 225)" />
        <path d="M225 134h47v47h-47zM294 132h49v12h-49zM294 156h38v10h-38zM224 207h116v10H224zM224 232h116v10H224zM224 257h91v10h-91z" fill="#7770b5" />
        <path d="m336 348 77-58 74 7-48 58Z" fill="#a6d682" stroke="#29244c" strokeWidth="5" /><ellipse cx="430" cy="287" rx="53" ry="38" fill="none" stroke="#9dd47a" strokeWidth="16" transform="rotate(7 430 287)" />
        <rect x="290" y="430" width="176" height="91" rx="4" fill="#eeedf7" stroke="#28234c" strokeWidth="5" transform="rotate(-25 378 476)" />
      </>}
    </svg>
  );
}

function Layout({ children, kind = "lock" }) {
  return <main className="shell"><aside className="visual"><ShieldArtwork kind={kind} /></aside><section className="content">{children}</section></main>;
}

const Icon = ({ type }) => type === "error" ? <span className="status-icon error">!</span> : <span className="status-icon">✓</span>;
const Back = ({ onClick }) => <button className="back" onClick={onClick} aria-label="Go back">←</button>;
const Button = ({ children, className = "", ...props }) => <button className={`primary ${className}`} {...props}>{children}</button>;

function FacilitySignup({ go }) {
  const [values, setValues] = useState({ name: "", type: "", category: "", registration: "", email: "", phone: "", address: "", firstName: "", lastName: "", password: "", confirmation: "", acceptedTerms: false });
  const [error, setError] = useState(""); const [busy,setBusy]=useState(false);
  const update = (key) => (event) => { setValues({ ...values, [key]: event.target.value }); setError(""); };
  const submit = async (event) => {
    event.preventDefault();
    const required = [values.name, values.type, values.category, values.registration, values.email, values.phone, values.address, values.firstName, values.lastName, values.password, values.confirmation];
    if (required.some((value) => !value.trim())) return setError("Complete all fields to create your facility account");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) return setError("Enter a valid facility email address");
    if (values.password.length < 8 || !/[A-Z]/.test(values.password) || !/\d/.test(values.password)) return setError("Password must have 8 characters, one uppercase letter, and one number");
    if (values.password !== values.confirmation) return setError("Passwords do not match");
    if (!values.acceptedTerms) return setError("Agree to the Terms of Service to continue");
    setBusy(true);
    try { const result=await hospitalApi.registerFacility({facilityName:values.name,facilityType:values.type,registrationNumber:values.registration,email:values.email,phone:values.phone,addressLine:values.address,firstName:values.firstName,lastName:values.lastName,password:values.password}); sessionStorage.setItem("hospitalFacilitySignup",JSON.stringify({email:values.email,facility:result.facility})); go("facility-email-verification"); } catch(e){setError(e.message)} finally{setBusy(false)}
  };
  return <Layout kind="documents"><form className="form signup-form facility-signup-form" onSubmit={submit} noValidate>
    <Back onClick={() => go("login")} />
    <header><h1>Facility Sign Up</h1></header>
    <section className="signup-section">
      <span className="signup-section-title">Facility Details</span>
      <label>Facility Name<span className="input-wrap"><input value={values.name} onChange={update("name")} placeholder="Enter Facility Name" /></span></label>
      <label>Facility Email<span className="input-wrap"><input type="email" value={values.email} onChange={update("email")} placeholder="example@gmail.com" /></span></label>
      <label>Phone Number<span className="input-wrap phone-input"><span className="phone-prefix">🇳🇬 +234⌄</span><input type="tel" inputMode="tel" value={values.phone} onChange={update("phone")} placeholder="810 047 5120" /></span></label>
      <div className="signup-grid signup-grid--two">
        <label>Facility Type<span className="input-wrap"><select value={values.type} onChange={update("type")}><option value="">Select Type</option><option>Hospital</option><option>Clinic</option><option>Diagnostic Centre</option><option>Pharmacy</option><option>Other</option></select></span></label>
        <label>Facility Category<span className="input-wrap"><select value={values.category} onChange={update("category")}><option value="">Select Category</option><option>Private</option><option>Public</option><option>Faith-Based</option><option>Non-Profit</option><option>Other</option></select></span></label>
      </div>
      <label>Facility License Number<span className="input-wrap"><input value={values.registration} onChange={update("registration")} placeholder="Enter License Number" /></span></label>
      <label>Facility Address<span className="input-wrap"><input value={values.address} onChange={update("address")} placeholder="Enter Facility Address" /></span></label>
    </section>
    <section className="signup-section">
      <span className="signup-section-title">Administrator Details</span>
      <div className="signup-grid signup-grid--two">
        <label>First Name<span className="input-wrap"><input value={values.firstName} onChange={update("firstName")} placeholder="Enter First Name" /></span></label>
        <label>Last Name<span className="input-wrap"><input value={values.lastName} onChange={update("lastName")} placeholder="Enter Last Name" /></span></label>
      </div>
    </section>
    <section className="signup-section signup-security">
      <span className="signup-section-title">Security</span>
      <PasswordInput label="Create Password" value={values.password} setValue={(password) => { setValues({ ...values, password }); setError(""); }} />
      <PasswordInput label="Confirm Password" value={values.confirmation} setValue={(confirmation) => { setValues({ ...values, confirmation }); setError(""); }} />
      <p className="password-hint">ⓘ Password should be at least 8 characters</p>
      <label className="terms-check"><input type="checkbox" checked={values.acceptedTerms} onChange={(event) => { setValues({ ...values, acceptedTerms: event.target.checked }); setError(""); }} /><span>I agree to the <button type="button">Terms of Service</button></span></label>
    </section>
    {error && <p className="field-error">ⓘ {error}</p>}<Button type="submit" disabled={busy}>{busy?"Creating Account…":"Create Account"}</Button>
    <p className="signin-prompt">Already have an account? <button type="button" onClick={() => go("login")}>Log In</button></p>
  </form></Layout>;
}

function FacilityEmailVerification({go}) {
  const [digits,setDigits]=useState(Array(6).fill("")); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const refs=useRef([]);
  let signup={}; try{signup=JSON.parse(sessionStorage.getItem("hospitalFacilitySignup")||"{}")}catch{}
  const submit=async(event)=>{event.preventDefault();const token=digits.join("");if(token.length!==6)return setError("Enter the complete 6 digit verification code");setBusy(true);try{const auth=await hospitalApi.verifyEmail(signup.email,token);sessionStorage.setItem("hospitalFacilitySignup",JSON.stringify({...signup,accessToken:auth.accessToken}));go("facility-1")}catch(e){setError(e.message)}finally{setBusy(false)}};
  return <Layout kind="documents"><Back onClick={()=>go("facility-signup")}/><form className="form code-form" onSubmit={submit}><header><h1>Verify Administrator Email</h1><p>Enter the code sent to <strong>{signup.email||"your administrator email"}</strong></p></header><div className="code-inputs">{digits.map((digit,i)=><input key={i} ref={node=>refs.current[i]=node} value={digit} inputMode="numeric" maxLength="1" placeholder="–" aria-label={`Verification code digit ${i+1}`} onChange={event=>{const next=[...digits];next[i]=event.target.value.replace(/\D/g,"").slice(-1);setDigits(next);setError("");if(next[i])refs.current[i+1]?.focus()}}/>)}</div>{error&&<p className="field-error">ⓘ {error}</p>}<Button disabled={busy}>{busy?"Verifying…":"Verify Email"}</Button></form></Layout>;
}

function Forgot({ go }) {
  const [mode, setMode] = useState("email");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const ok = mode === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) : /^\d{10,14}$/.test(value.replace(/\D/g, ""));
    if (!ok) return setError(`Enter a valid ${mode === "email" ? "email address" : "phone number"}`);
    sessionStorage.setItem("hospitalRecoveryContact", value.trim());
    go("reset-code");
  };
  return <Layout><Back onClick={() => history.back()} /><form className="form forgot" onSubmit={submit} noValidate>
    <header><h1>Forgot Password?</h1><p>No worries! Enter your registered email address or phone number</p></header>
    <label>{mode === "email" ? "Email" : "Phone Number"}<span className="input-wrap">{mode === "phone" && <span className="country">🇳🇬 +234⌄</span>}<input type={mode === "email" ? "email" : "tel"} inputMode={mode === "email" ? "email" : "numeric"} placeholder={mode === "email" ? "Enter email address" : "810 047 5120"} value={value} onChange={e => { setValue(e.target.value); setError(""); }} /></span></label>
    {error && <p className="field-error">ⓘ {error}</p>}
    <Button type="submit">Submit</Button>
  </form><button className="mode-switch" onClick={() => { setMode(mode === "email" ? "phone" : "email"); setValue(""); setError(""); }}>Use {mode === "email" ? "Phone Number" : "Email"}</button></Layout>;
}

function ResetCode({ go }) {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const refs = useRef([]);
  const contact = sessionStorage.getItem("hospitalRecoveryContact") || "example@gmail.com";
  const change = (index, raw) => { const next = [...digits]; next[index] = raw.replace(/\D/g, "").slice(-1); setDigits(next); setError(""); if (next[index]) refs.current[index + 1]?.focus(); };
  return <Layout><Back onClick={() => go("forgot")} /><form className="form code-form" onSubmit={e => { e.preventDefault(); digits.every(Boolean) ? go("new-password") : setError("Enter the complete 6 digit reset code"); }}>
    <header><h1>Email Verification</h1><p>Enter the 6 digit password reset code sent to <strong>{contact}</strong></p></header>
    <div className="code-inputs" onPaste={e => { const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); if (pasted) { e.preventDefault(); setDigits(Array.from({ length: 6 }, (_, i) => pasted[i] || "")); } }}>{digits.map((digit, i) => <input key={i} ref={node => refs.current[i] = node} value={digit} onChange={e => change(i, e.target.value)} onKeyDown={e => e.key === "Backspace" && !digit && refs.current[i - 1]?.focus()} inputMode="numeric" maxLength="1" aria-label={`Reset code digit ${i + 1}`} placeholder="–" />)}</div>
    {error && <p className="field-error">ⓘ {error}</p>}<Button type="submit">Confirm</Button><p className="resend">Didn’t get the code? <button type="button" onClick={() => setError("A new code has been sent")}>Resend Code</button></p>
  </form></Layout>;
}

function PasswordInput({ label, value, setValue }) { const [visible, setVisible] = useState(false); return <label>{label}<span className="input-wrap"><input type={visible ? "text" : "password"} placeholder="Enter Password" value={value} onChange={e => setValue(e.target.value)} /><button type="button" className="eye" onClick={() => setVisible(!visible)} aria-label={`${visible ? "Hide" : "Show"} ${label}`}>{visible ? "◉" : "◎"}</button></span></label>; }

function NewPassword({ go }) {
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [error, setError] = useState("");
  const rules = [["At least 8 characters", password.length >= 8], ["A mix of uppercase and lowercase letters", /[A-Z]/.test(password) && /[a-z]/.test(password)], ["At least one number", /\d/.test(password)], ["At least one symbol", /[^A-Za-z0-9]/.test(password)]];
  return <Layout><Back onClick={() => go("reset-code")} /><form className="form password-form" onSubmit={e => { e.preventDefault(); if (!rules.every(r => r[1])) return setError("Your password must meet all requirements"); if (password !== confirm) return setError("Passwords do not match"); go("reset-success"); }}><header><h1>Create New Password</h1><p>Secure your facility account with a strong password</p></header><PasswordInput label="Password" value={password} setValue={setPassword} /><PasswordInput label="Confirm Password" value={confirm} setValue={setConfirm} /><section className="requirements"><p>Create a secure password by meeting the following requirements</p><div className="strength"><i className={rules[0][1] ? "met" : ""} /><i className={rules[1][1] ? "met" : ""} /><i className={rules[2][1] ? "met" : ""} /><i className={rules[3][1] ? "met" : ""} /></div>{rules.map(([text, met]) => <span className={met ? "met" : ""} key={text}>{met ? "✓" : "○"} {text}</span>)}</section>{error && <p className="field-error">ⓘ {error}</p>}<Button>Confirm</Button></form></Layout>;
}

function Status({ type = "success", context = "credentials", go }) {
  const credentials = context === "credentials"; const failed = type === "error";
  return <Layout kind={credentials ? "documents" : "lock"}><div className="status"><Icon type={failed ? "error" : "success"} /><h1>{failed ? "Unable to Submit" : credentials ? "Credentials Submitted" : "Password Successfully Reset"}</h1><p>{failed ? <>Your credentials couldn’t be submitted.<br />Check your details and try again.</> : credentials ? <>Your credentials have been received and are being reviewed.<br />An email will be sent once the process is complete.</> : <>You can now log-in using your new password</>}</p><Button onClick={() => go(failed ? "facility-3" : credentials ? "facility-1" : "forgot")}>{failed ? "Try Again" : credentials ? "Proceed" : "Proceed to Log In"}</Button></div></Layout>;
}

const stages = [
  { title: "Stage One (1)", subtitle: "Confirm the facility is a real registered organization", docs: [["REGISTRATION_CERTIFICATE", "Facility Registration Certificate (CAC)", "Proof your facility is legally registered"], ["ADMIN_ID", "Valid ID of Facility Owner / Admin", "Government-issued ID to verify the facility administrator"]] },
  { title: "Stage Two (2)", subtitle: "Confirm your facility is legally allowed to provide healthcare services", docs: [["FACILITY_LICENSE", "Healthcare Facility License (State Ministry of Health)", "License confirming your facility can provide healthcare services"], ["MEDICAL_DIRECTOR_LICENSE", "Medical Director’s Practicing License (MDCN)", "Valid MDCN license verifying the medical director is certified to practice medicine"]] },
  { title: "Stage Three (3)", subtitle: "Trust & Quality Verification", docs: [["ADDRESS_PROOF", "Proof of Facility Address", "Document confirming the physical location of your healthcare facility"]] },
];

function Facility({ step, go }) {
  const [uploads, setUploads] = useState(() => { try { return JSON.parse(sessionStorage.getItem("hospitalUploads")) || {}; } catch { return {}; } });
  const [error, setError] = useState(""); const [busy,setBusy]=useState(""); const stage = stages[step - 1];
  const upload = async (key, type, file) => { if (!file) return; let signup={};try{signup=JSON.parse(sessionStorage.getItem("hospitalFacilitySignup")||"{}")}catch{} if(!signup.facility?.id||!signup.accessToken)return setError("Your verified registration session is missing. Please register again.");setBusy(key);setError("");try{await hospitalApi.uploadFacilityDocument(signup.facility.id,type,file,signup.accessToken);const next={...uploads,[key]:file.name};setUploads(next);sessionStorage.setItem("hospitalUploads",JSON.stringify(next))}catch(e){setError(e.message)}finally{setBusy("")} };
  const next = () => { const keys = stage.docs.map((_, i) => `${step}-${i}`); if (!keys.every(key => uploads[key])) return setError("Upload each required document before continuing"); go(step === 3 ? "credentials-success" : `facility-${step + 1}`); };
  return <Layout kind="documents"><div className="facility"><header><h1>Facility Account Verification</h1><p>Verify your facility license and other credentials to get verified</p><div className="progress">{[1, 2, 3].map(n => <i className={n <= step ? "active" : ""} key={n} />)}</div></header><section className="stage-card"><span className="document-icon">▤</span><div><h2>{stage.title}</h2><p>{stage.subtitle}</p></div></section><section className="documents">{stage.docs.map(([type,title, description], i) => { const key = `${step}-${i}`; return <label className="document" key={type}><input type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={Boolean(busy)} onChange={e => upload(key,type,e.target.files?.[0])} /><span><b>{title}</b><em className={uploads[key] ? "uploaded" : ""}>{busy===key?"Uploading…":uploads[key] ? "Uploaded" : "Upload"}</em><small>{uploads[key] || description}</small></span><strong>›</strong></label>; })}</section>{error && <p className="field-error facility-error">ⓘ {error}</p>}<footer>{step > 1 && <button className="secondary" onClick={() => go(`facility-${step - 1}`)}>Previous</button>}<Button disabled={Boolean(busy)} onClick={next}>{step === 3 ? "Submit for Review" : "Next"}</Button></footer></div></Layout>;
}

const valid = new Set(["login", "home", "calendar", "appointments", "appointment-details", "referrals", "referral-details", "staff-management", "add-staff", "invite-staff", "staff-invitation", "staff-profile", "activity-log", "messages", "notifications", "settings", "analysis", "patients", "add-patient", "patient-profile", "visit-logs", "health-conditions", "medications", "lab-records", "vaccinations", "surgical-records", "other-documents", "emergency-contacts", "facility-signup", "facility-email-verification", "signup", "forgot", "reset-code", "new-password", "reset-success", "facility-1", "facility-2", "facility-3", "credentials-success", "credentials-error"]);
function readRoute() { const route = window.location.hash.replace(/^#\/?/, "").split("?")[0]; return valid.has(route) ? route : "login"; }
export default function App() {
  const [route, setRoute] = useState(readRoute); const go = next => { window.location.hash = `/${next}`; setRoute(next); };
  useEffect(() => { const handler = () => setRoute(readRoute()); window.addEventListener("hashchange", handler); return () => window.removeEventListener("hashchange", handler); }, []);
  const ui = { Layout, Back, Button, PasswordInput };
  const publicRoutes=new Set(["login","staff-invitation","facility-signup","facility-email-verification","signup","forgot","reset-code","new-password","reset-success","facility-1","facility-2","facility-3","credentials-success","credentials-error"]);
  if(!publicRoutes.has(route)&&!hospitalApi.isAuthenticated()){window.location.hash="/login";return <FacilitySignIn go={go} ui={ui}/>;}
  if (route === "home") return <HospitalHome go={go} />;
  if (route === "calendar") return <HospitalCalendar go={go} />;
  if (route === "appointments") return <AppointmentDashboard go={go} />;
  if (route === "appointment-details") return <AppointmentDetails go={go} />;
  if (route === "referrals") return <ReferralDashboard go={go} />;
  if (route === "referral-details") return <ReferralDetails go={go} />;
  if (route === "staff-management") return <StaffManagement go={go} />;
  if (route === "add-staff") return <AddStaff go={go} />;
  if (route === "invite-staff") return <AddStaff go={go} existing />;
  if (route === "staff-profile") return <StaffProfile go={go} />;
  if (route === "activity-log") return <ActivityLog go={go} />;
  if (route === "messages") return <MessageCenter go={go} />;
  if (route === "notifications") return <NotificationCenter go={go} />;
  if (route === "settings") return <Settings go={go} />;
  if (route === "analysis") return <AnalysisDashboard go={go} />;
  if (route === "patients") return <Patients go={go} />;
  if (route === "add-patient") return <AddPatient go={go} />;
  if (route === "patient-profile") return <PatientProfile go={go} />;
  if (route === "visit-logs") return <VisitLogs go={go} />;
  if (route === "health-conditions") return <PatientRecords type="conditions" go={go} />;
  if (route === "medications") return <PatientRecords type="medications" go={go} />;
  if (route === "lab-records") return <PatientRecords type="labs" go={go} />;
  if (route === "vaccinations") return <PatientRecords type="vaccinations" go={go} />;
  if (route === "surgical-records") return <PatientRecords type="surgeries" go={go} />;
  if (route === "other-documents") return <PatientDocuments go={go} />;
  if (route === "emergency-contacts") return <EmergencyContacts go={go} />;
  if (route === "login") return <FacilitySignIn go={go} ui={ui} />;
  if (route === "staff-invitation") return <FacilityStaffInvitation go={go} ui={ui}/>;
  if (route === "facility-signup" || route === "signup") return <FacilitySignup go={go} />;
  if (route === "facility-email-verification") return <FacilityEmailVerification go={go} />;
  if (route === "forgot") return <ForgotPassword go={go} ui={ui} />;
  if (route === "reset-code") return <ResetCodePage go={go} ui={ui} />;
  if (route === "new-password") return <CreateNewPassword go={go} ui={ui} />;
  if (route === "reset-success") return <PasswordResetSuccess go={go} ui={ui} />;
  if (route.startsWith("facility-")) return <Facility step={Number(route.at(-1))} go={go} />;
  return <Status type={route.endsWith("error") ? "error" : "success"} go={go} />;
}
