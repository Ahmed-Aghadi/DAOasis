import { Layout } from "@/components/Layout";
import { useContext, useEffect } from "react";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Dashboard() {
    const ctx = useContext(SafeAuthContext);
    const router = useRouter();
    useEffect(() => {
        if (ctx.loading) return;
        if (ctx.safeAuthSignInResponse?.eoa === undefined)
            router.push("/login");
    }, [ctx]);

    return (
        <Layout>
            <Head>
                <title>Dashboard</title>
            </Head>
            <h1>Dashboard</h1>
        </Layout>
    );
}
