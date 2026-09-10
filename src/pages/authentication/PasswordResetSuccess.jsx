export default function PasswordResetSuccess({ go, ui }) {
  const { Layout, Button } = ui;
  return <Layout><div className="status"><span className="status-icon">✓</span><h1>Password Successfully Reset</h1><p>You can now log-in using your new password</p><Button onClick={() => go("login")}>Proceed to Log In</Button></div></Layout>;
}
