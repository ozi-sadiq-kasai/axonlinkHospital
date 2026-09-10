import { useRef, useState } from "react";

export default function ResetCode({ go, ui }) {
  const { Layout, Back, Button } = ui;
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [message, setMessage] = useState("");
  const refs = useRef([]);
  const contact = window.sessionStorage.getItem("hospitalRecoveryContact") || "example@gmail.com";
  const update = (index, raw) => { const next = [...digits]; next[index] = raw.replace(/\D/g, "").slice(-1); setDigits(next); setMessage(""); if (next[index]) refs.current[index + 1]?.focus(); };
  return <Layout><Back onClick={() => go("forgot")} /><form className="form code-form" onSubmit={(event) => { event.preventDefault(); digits.every(Boolean) ? go("new-password") : setMessage("Enter the complete 6 digit reset code"); }}>
    <header><h1>Email Verification</h1><p>Enter the 6 digit password reset code sent to <strong>{contact}</strong></p></header>
    <div className="code-inputs">{digits.map((digit, index) => <input key={index} ref={(node) => refs.current[index] = node} value={digit} onChange={(event) => update(index, event.target.value)} onKeyDown={(event) => event.key === "Backspace" && !digit && refs.current[index - 1]?.focus()} inputMode="numeric" maxLength="1" aria-label={`Reset code digit ${index + 1}`} placeholder="–" />)}</div>
    {message && <p className="field-error">ⓘ {message}</p>}<Button type="submit">Confirm</Button><p className="resend">Didn’t get the code? <button type="button" onClick={() => setMessage("A new code has been requested")}>Resend Code</button></p>
  </form></Layout>;
}
