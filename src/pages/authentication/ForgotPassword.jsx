import { useState } from "react";

export default function ForgotPassword({ go, ui }) {
  const { Layout, Back, Button } = ui;
  const [mode, setMode] = useState("email");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  function submit(event) {
    event.preventDefault();
    const valid = mode === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) : /^\d{10,14}$/.test(value.replace(/\D/g, ""));
    if (!valid) return setError(`Enter a valid ${mode === "email" ? "email address" : "phone number"}`);
    window.sessionStorage.setItem("hospitalRecoveryContact", value.trim());
    go("reset-code");
  }
  return <Layout><Back onClick={() => go("login")} /><form className="form forgot" onSubmit={submit} noValidate>
    <header><h1>Forgot Password?</h1><p>No worries! Enter your registered email address or phone number</p></header>
    <label>{mode === "email" ? "Email" : "Phone Number"}<span className="input-wrap">{mode === "phone" && <span className="country">🇳🇬 +234⌄</span>}<input type={mode === "email" ? "email" : "tel"} inputMode={mode === "email" ? "email" : "numeric"} placeholder={mode === "email" ? "Enter email address" : "810 047 5120"} value={value} onChange={(event) => { setValue(event.target.value); setError(""); }} /></span></label>
    {error && <p className="field-error">ⓘ {error}</p>}<Button type="submit">Submit</Button>
  </form><button className="mode-switch" onClick={() => { setMode(mode === "email" ? "phone" : "email"); setValue(""); setError(""); }}>Use {mode === "email" ? "Phone Number" : "Email"}</button></Layout>;
}
