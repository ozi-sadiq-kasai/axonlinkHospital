import { useState } from "react";

export default function CreateNewPassword({ go, ui }) {
  const { Layout, Back, Button, PasswordInput } = ui;
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const rules = [["At least 8 characters", password.length >= 8], ["A mix of uppercase and lowercase letters", /[A-Z]/.test(password) && /[a-z]/.test(password)], ["At least one number", /\d/.test(password)], ["At least one symbol", /[^A-Za-z0-9]/.test(password)]];
  function submit(event) { event.preventDefault(); if (!rules.every((rule) => rule[1])) return setError("Your password must meet all requirements"); if (password !== confirmation) return setError("Passwords do not match"); go("reset-success"); }
  return <Layout><Back onClick={() => go("reset-code")} /><form className="form password-form" onSubmit={submit}><header><h1>Create New Password</h1><p>Secure your facility account with a strong password</p></header><PasswordInput label="Password" value={password} setValue={(value) => { setPassword(value); setError(""); }} /><PasswordInput label="Confirm Password" value={confirmation} setValue={(value) => { setConfirmation(value); setError(""); }} /><section className="requirements"><p>Create a secure password by meeting the following requirements</p><div className="strength">{rules.map(([, met], index) => <i className={met ? "met" : ""} key={index} />)}</div>{rules.map(([text, met]) => <span className={met ? "met" : ""} key={text}>{met ? "✓" : "○"} {text}</span>)}</section>{error && <p className="field-error">ⓘ {error}</p>}<Button>Confirm</Button></form></Layout>;
}
