import { useState } from "react";
import { hospitalApi } from "../../hospitalApi";

export default function FacilitySignIn({ go, ui }) {
  const { Layout, Back, Button, PasswordInput } = ui;
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!identity.trim() || !password) return setError("Enter your facility email or phone number and password");
    if(!identity.includes("@"))return setError("Use the email address linked to your facility administrator account.");
    setBusy(true);setError("");
    try{await hospitalApi.login(identity,password);go("home");}catch(reason){setError(reason.message)}finally{setBusy(false)}
  }

  return <Layout kind="signin"><Back onClick={() => window.history.back()} /><form className="form signin-form" onSubmit={submit} noValidate>
    <header><h1>Welcome Back</h1><span className="login-pill">Facility Admin Log-In</span></header>
    <label>Facility Email/Phone<span className="input-wrap"><input value={identity} onChange={(event) => { setIdentity(event.target.value); setError(""); }} placeholder="Enter email address or phone number" autoComplete="username" /></span></label>
    <PasswordInput label="Password" value={password} setValue={(value) => { setPassword(value); setError(""); }} />
    <button className="forgot-link" type="button" onClick={() => go("forgot")}>Forgot Password</button>
    {error && <p className="field-error">ⓘ {error}</p>}
    <Button type="submit" disabled={busy}>{busy?"Logging In…":"Log In"}</Button>
    <p className="signin-prompt">New to AxonLink? <button type="button" onClick={() => go("facility-signup")}>Register Facility</button></p>
  </form></Layout>;
}
