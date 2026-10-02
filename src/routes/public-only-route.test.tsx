import {render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router";
import {beforeEach, describe, expect, it, vi} from "vitest";
import PublicOnlyRoute from "./public-only-route.tsx";

const authState = vi.hoisted(() => ({isAuthenticated: false, initializing: false}));

vi.mock("@/lib/auth.tsx", () => ({
    useAuth: () => authState,
}));

function renderRoute() {
    return render(
        <MemoryRouter initialEntries={["/login"]}>
            <Routes>
                <Route element={<PublicOnlyRoute/>}>
                    <Route path="/login" element={<div>Login form</div>}/>
                </Route>
                <Route path="/" element={<div>Home page</div>}/>
            </Routes>
        </MemoryRouter>,
    );
}

describe("PublicOnlyRoute", () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        authState.initializing = false;
    });

    it("renders a session status while authentication initializes", () => {
        authState.initializing = true;
        renderRoute();
        expect(screen.getByRole("status")).toHaveTextContent(/checking your session/i);
    });

    it("shows the public page for signed-out users", () => {
        renderRoute();
        expect(screen.getByText("Login form")).toBeInTheDocument();
    });

    it("redirects signed-in users home", () => {
        authState.isAuthenticated = true;
        renderRoute();
        expect(screen.getByText("Home page")).toBeInTheDocument();
    });
});
