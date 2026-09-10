import React from "react";
import {render,screen} from "@testing-library/react";
import {beforeEach,describe,expect,it,vi} from "vitest";
const {listAppointments}=vi.hoisted(()=>({listAppointments:vi.fn()}));
vi.mock("../hospitalApi",()=>({hospitalApi:{listAppointments}}));
vi.mock("../pages/HospitalChrome",()=>({default:({children})=><div>{children}</div>}));
import AppointmentDashboard from "../pages/appointment/AppointmentDashboard";
describe("Hospital appointment states",()=>{beforeEach(()=>listAppointments.mockReset());it("shows loading and all empty operational sections",async()=>{let done;listAppointments.mockReturnValue(new Promise(resolve=>{done=resolve}));render(<AppointmentDashboard go={()=>{}}/>);expect(screen.getByText("Loading appointments")).toBeInTheDocument();done({appointments:[]});expect(await screen.findByText("No scheduled appointments")).toBeInTheDocument();expect(screen.getByText("Waiting room is empty")).toBeInTheDocument();expect(screen.getByText("No upcoming appointments")).toBeInTheDocument();expect(screen.getByText("No concluded appointments")).toBeInTheDocument()})});
