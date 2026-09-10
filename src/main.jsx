import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./hospital.css";
import "./patient.css";
import "./records.css";
import "./appointment.css";
import "./referral.css";
import "./referral-details.css";
import "./staff-management.css";
import "./activity-log.css";
import "./notification.css";
import "./settings.css";
import "./analysis.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="startup-error">
          <h1>AxonLink Hospital could not start</h1>
          <p>{this.state.error.message}</p>
          <button type="button" onClick={() => window.location.reload()}>Reload</button>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(<AppErrorBoundary><App /></AppErrorBoundary>);
