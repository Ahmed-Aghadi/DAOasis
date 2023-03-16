import { AppShell, Navbar, Header } from "@mantine/core";
import { HeaderResponsive } from "./Headers";
import { useContext, useEffect, useState } from "react";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import { useRouter } from "next/router";

export function Layout({ children }: { children: React.ReactNode }) {
    const ctx = useContext(SafeAuthContext);
    const router = useRouter();

    useEffect(() => {
        if (ctx.loading) return;
        if (!ctx.safeAuthSignInResponse?.eoa) router.push("/login");
    }, [ctx.safeAuthSignInResponse, ctx.provider, ctx.loading]);

    return (
        <AppShell
            // navbar={<Navbar />}
            header={<HeaderResponsive />}
        >
            <button onClick={() => console.log(ctx)}>Dashboard</button>
            {children}
        </AppShell>
    );
}
