import Head from "next/head";
import { SafeAuthKit, SafeAuthProviderType } from "@safe-global/auth-kit";
import Login from "@/components/Login";
import Logout from "@/components/Logout";
import { Layout } from "@/components/Layout";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import { useContext } from "react";
import { HeroTitle } from "@/components/Hero";

export default function Home() {
    const ctx = useContext(SafeAuthContext);

    const getAllRecords = async () => {
        const res = await fetch("/api/polybase");
        const data = await res.json();
        console.log("DATA", data);
    };

    const getRecords = async () => {
        const res = await fetch(
            "/api/polybase/0x0de82DCC40B8468639251b089f8b4A4400022e04"
        );
        const data = await res.json();
        console.log("DATA", data);
    };

    const createRecord = async () => {
        const res = await fetch(
            "/api/polybase/0x0de82DCC40B8468639251b089f8b4A4400022e04",
            {
                method: "POST",
            }
        );
        const data = await res.json();
        console.log("DATA", data);
    };

    const updateRecord = async () => {
        const res = await fetch(
            "/api/polybase/0x0de82DCC40B8468639251b089f8b4A4400022e04",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: "test",
                    description: "test",
                    image: "test",
                }),
            }
        );
        const data = await res.json();
        console.log("DATA", data);
    };

    const createCollection = async () => {
        // const res = await fetch("/api/polybase?id=0x0de82DCC40B8468639251b089f8b4A4400022e04");

        // const res = await fetch("/api/polybase", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         name: "test",
        //     }),
        // });

        const res = await fetch("/api/polybase", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: "test",
                id: "60f1b1b0-1b1b-4b1b-1b1b-1b1b1b1b1b1b",
            }),
        });
        console.log("RES", res);
        const data = await res.json();
        console.log("DATA", data);
    };

    return (
        <>
            <Head>
                <title>StakeSquadron</title>
                <meta name="description" content="A multi-sig dao" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <HeroTitle />
        </>
    );
}

// <Login/>
// <Logout/>
// <button onClick={() => console.log(ctx)}>Log Context</button>
// {/* <button onClick={() => createCollection()}>
//                 Create Collection
//             </button> */}
// <button onClick={() => getAllRecords()}>Get All Records</button>
// <button onClick={() => getRecords()}>Get Records</button>
// <button onClick={() => createRecord()}>Create Record</button>
// <button onClick={() => updateRecord()}>Update Record</button>
// <main>Hello World</main>
