import { AppShell, Navbar, Header } from "@mantine/core";
import { HeaderResponsive } from "./Headers";

export function Layout({ children }: { children: React.ReactNode }) {
    // Navbar and Header will not be rendered when hidden prop is set
    return (
        <AppShell
            // navbar={<Navbar />}
            header={<HeaderResponsive />}
        >
            {children}
        </AppShell>
    );
}
