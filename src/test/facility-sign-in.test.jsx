import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { login } = vi.hoisted(() => ({ login: vi.fn() }));
vi.mock("../hospitalApi", () => ({ hospitalApi: { login } }));

import FacilitySignIn from "../pages/authentication/FacilitySignIn";

const Layout = ({ children }) => <main>{children}</main>;
const Back = ({ onClick }) => <button onClick={onClick}>Back</button>;
const Button = ({ children, ...props }) => <button {...props}>{children}</button>;
const PasswordInput = ({ label, value, setValue }) => <label>{label}<input aria-label={label} value={value} onChange={(event) => setValue(event.target.value)} /></label>;

describe("Facility sign in", () => {
  it("opens the hospital home after a successful administrator login", async () => {
    login.mockResolvedValueOnce({ membership: { role: "FACILITY_ADMIN" } });
    const go = vi.fn();
    render(<FacilitySignIn go={go} ui={{ Layout, Back, Button, PasswordInput }} />);

    fireEvent.change(screen.getByPlaceholderText("Enter email address or phone number"), { target: { value: "admin@hospital.test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Secure123" } });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => expect(login).toHaveBeenCalledWith("admin@hospital.test", "Secure123"));
    expect(go).toHaveBeenCalledWith("home");
  });
});
