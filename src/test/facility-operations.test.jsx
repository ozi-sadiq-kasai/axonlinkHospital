import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  listPatients: vi.fn(), listStaff: vi.fn(), listAppointments: vi.fn(),
  appointmentOptions: vi.fn(), createAppointment: vi.fn(), updateAppointment: vi.fn(),
  session: vi.fn(() => ({ membership: { facility: { name: "Saferview Hospital" } } }))
}));
vi.mock("../hospitalApi", () => ({ hospitalApi: api }));
import HospitalHome from "../pages/home/HospitalHome";
import HospitalCalendar from "../pages/home/HospitalCalendar";

const atLocalHour = (dayOffset, hour) => { const date = new Date(); date.setDate(date.getDate() + dayOffset); date.setHours(hour, 0, 0, 0); return date.toISOString(); };
const records = [
  { id: "waiting-1", patient: "Ada Nwosu", clinician: "Dr Bello", date: atLocalHour(0, 9), status: "WAITING", checkedInAt: atLocalHour(0, 9) },
  { id: "future-1", patient: "Bola Musa", clinician: "Dr Obi", date: atLocalHour(1, 10), status: "CONFIRMED", visitType: "Follow-up" },
  { id: "pending-1", patient: "Chidi Okafor", clinician: "Dr Bello", date: atLocalHour(1, 11), status: "PENDING" }
];

describe("live facility operations", () => {
  beforeEach(() => {
    Object.values(api).forEach((value) => value?.mockReset?.());
    api.session.mockReturnValue({ membership: { facility: { name: "Saferview Hospital" } } });
    api.listPatients.mockResolvedValue({ patients: [{ id: "fp-1", name: "Ada Nwosu" }] });
    api.listStaff.mockResolvedValue({ staff: [{ id: "s1", role: "GENERALIST" }, { id: "s2", role: "RECEPTIONIST" }], invitations: [{ id: "i1" }] });
    api.listAppointments.mockResolvedValue({ appointments: records });
    api.appointmentOptions.mockResolvedValue({ patients: [], clinicians: [] });
    api.updateAppointment.mockImplementation(async (id, change) => ({ appointment: { ...records.find((item) => item.id === id), status: change.status } }));
  });

  it("renders staff, invitations, waiting room, and appointments from live responses", async () => {
    render(<HospitalHome go={() => {}} />);
    expect(await screen.findByText("Bola Musa")).toBeInTheDocument();
    expect(screen.getByText("Ada Nwosu")).toBeInTheDocument();
    expect(screen.getByText("Chidi Okafor")).toBeInTheDocument();
    await waitFor(() => expect(api.listStaff).toHaveBeenCalledTimes(1));
    const generalist = screen.getByText("Generalist (Doctor)").parentElement;
    expect(generalist.querySelector("b")).toHaveTextContent("1");
    const invitations = screen.getByText("Pending Invitation").parentElement;
    expect(invitations.querySelector("b")).toHaveTextContent("1");
  });

  it("updates pending requests through the backend status contract", async () => {
    render(<HospitalHome go={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: "Accept" }));
    await waitFor(() => expect(api.updateAppointment).toHaveBeenCalledWith("pending-1", { status: "CONFIRMED" }));
  });

  it("renders the same live appointments on the calendar", async () => {
    render(<HospitalCalendar go={() => {}} />);
    expect(await screen.findByText("Ada Nwosu")).toBeInTheDocument();
    expect(api.listAppointments).toHaveBeenCalledTimes(1);
  });

  it("shows an actionable calendar error state", async () => {
    api.listAppointments.mockRejectedValueOnce(new Error("Schedule service unavailable"));
    render(<HospitalCalendar go={() => {}} />);
    expect(await screen.findByText("Unable to load appointments")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
