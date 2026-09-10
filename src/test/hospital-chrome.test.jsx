import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HospitalChrome from "../pages/HospitalChrome";

describe("Hospital chrome", () => {
  it("renders the authenticated facility name in the header and sidebar", () => {
    sessionStorage.setItem("axonlink-hospital-session", JSON.stringify({
      accessToken: "test-token",
      membership: { facility: { id: "facility-1", name: "Emirate Specialist Hospital" } }
    }));

    render(<HospitalChrome title="Home" go={() => {}}><div>Dashboard</div></HospitalChrome>);

    expect(screen.getAllByText("Emirate Specialist Hospital")).toHaveLength(2);
    expect(screen.queryByText("AxonLink Hospital")).not.toBeInTheDocument();
  });

  it("uses a neutral label when facility session details are unavailable", () => {
    render(<HospitalChrome title="Home" go={() => {}}><div>Dashboard</div></HospitalChrome>);
    expect(screen.getAllByText("Facility")).toHaveLength(2);
  });
});
