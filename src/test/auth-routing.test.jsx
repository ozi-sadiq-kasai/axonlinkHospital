import React from "react";
import {fireEvent,render,screen} from "@testing-library/react";
import {describe,expect,it,vi} from "vitest";
vi.mock("../hospitalApi",()=>({hospitalApi:{isAuthenticated:()=>false}}));
vi.mock("../pages/authentication/FacilitySignIn",()=>({default:()=> <div>Hospital sign in</div>}));
import App from "../App";
describe("Hospital route protection",()=>{it("redirects an unauthenticated protected route to sign in",()=>{location.hash="#/appointments";render(<App/>);expect(screen.getByText("Hospital sign in")).toBeInTheDocument();expect(location.hash).toBe("#/login")});it("validates facility registration before sending data",()=>{location.hash="#/facility-signup";render(<App/>);fireEvent.click(screen.getByRole("button",{name:"Create Account"}));expect(screen.getByText(/Complete all fields/)).toBeInTheDocument()})});
