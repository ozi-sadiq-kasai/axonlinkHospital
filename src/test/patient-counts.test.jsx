import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { listPatients, session } = vi.hoisted(() => ({
  listPatients: vi.fn(),
  session: vi.fn(() => ({ membership: { facility: { name: "Saferview Hospital" } } }))
}));
vi.mock("../hospitalApi", () => ({ hospitalApi: { listPatients, session } }));
vi.mock("../pages/hospitalData", () => ({
  useHospitalData: () => ({
    data: { appointments: [], staff: [], referrals: [] },
    addAppointment: vi.fn(),
    updateAppointment: vi.fn()
  }),
  formatDate: (value) => String(value),
  formatTime: (value) => String(value)
}));

import HospitalHome from "../pages/home/HospitalHome";
import AnalysisDashboard from "../pages/analysis/AnalysisDashboard";
import Patients from "../pages/patient/Patients";

const livePatients = [
  { id: "patient-1", name: "Ada Nwosu", status: "ACTIVE", gender: "Female" },
  { id: "patient-2", name: "Bola Musa", status: "PENDING_CLAIM", gender: "Male" },
  { id: "patient-3", name: "Chidi Okafor", status: "ACTIVE", gender: "Male" }
];

describe("live facility patient totals", () => {
  beforeEach(() => {
    listPatients.mockReset();
    listPatients.mockResolvedValue({ patients: livePatients });
  });

  it("uses the live patient directory total on Home", async () => {
    render(<HospitalHome go={() => {}} />);
    expect(await screen.findByText("3")).toBeInTheDocument();
    expect(listPatients).toHaveBeenCalledTimes(1);
  });

  it("uses all live linked patients in Report and Analysis", async () => {
    render(<AnalysisDashboard go={() => {}} />);
    const label = screen.getByText("Total Patients");
    await waitFor(() => expect(label.parentElement.querySelector("b")).toHaveTextContent("3"));
    expect(listPatients).toHaveBeenCalledTimes(1);
  });

  it("uses the same live source for the Patient directory", async () => {
    render(<Patients go={() => {}} />);
    expect(await screen.findByText("Ada Nwosu")).toBeInTheDocument();
    expect(screen.getByText("Bola Musa")).toBeInTheDocument();
    expect(screen.getByText("Invitation pending")).toBeInTheDocument();
    expect(listPatients).toHaveBeenCalledTimes(1);
  });
});
