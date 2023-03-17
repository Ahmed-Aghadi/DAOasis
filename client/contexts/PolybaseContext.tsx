import { getAllSafe, getProfile } from "@/lib/polybase";
import React, { useContext, useEffect, useState } from "react";
import SafeAuthContext from "./SafeAuthContext";

export type User = {
    id: string;
    name: string;
    description: string;
};

export type MultiSig = {
    id: string;
    owners: string[];
    threshold: number;
    name: string;
    description: string;
};

const PolybaseContext = React.createContext({
    user: {
        id: "",
        name: "",
        description: "",
    } as User | undefined,
    setUser: (user: User) => {},
    multiSigs: [
        {
            id: "",
            owners: [] as string[],
            threshold: 0,
            name: "",
            description: "",
        },
    ],
    setMultiSigs: (multiSigs: MultiSig[]) => {},
    isProfileExists: false,
    setIsProfileExists: (isProfileExists: boolean) => {},
    loading: true,
    setLoading: (loading: boolean) => {},
});

export const PolybaseContextProvider = (props: any) => {
    const [user, setUser] = useState<User>();
    const [multiSigs, setMultiSigs] = useState<MultiSig[]>([]);
    const safeContext = useContext(SafeAuthContext);
    const [loading, setLoading] = useState(true);
    const [isProfileExists, setIsProfileExists] = useState(false);

    useEffect(() => {
        console.log("SAFE CONTEXT: ", safeContext.safeAuthSignInResponse)
        if (!safeContext.safeAuthSignInResponse?.eoa) return;
        const { eoa } = safeContext.safeAuthSignInResponse as {
            eoa: `0x${string}`;
        };
        (async () => {
            console.log("LOADING: ", loading)
            setLoading(true);
            try {
                console.log("EOA: ", eoa);
                const profile = await getProfile(eoa);
                console.log("PROFILE: ", profile);
                setUser(profile.response.data as User);
                const allSafe = await getAllSafe();
                console.log("ALL SAFE: ", allSafe);
                const userSafes = allSafe.response.data.filter(
                    (safe: { data: MultiSig }) => {
                        return safe.data.owners.includes(eoa); // NOTE: Might need to check for lowercase and uppercase in the future
                    }
                );
                const userSafesData = userSafes.map(
                    (safe: { data: MultiSig }) => safe.data
                );
                setMultiSigs(userSafesData);
                // console.log("USER SAFES: ", userSafesData);
                setIsProfileExists(true);
            } catch (error) {
                console.log("ERROR: ", error);
                setIsProfileExists(false);
            }
            setLoading(false);
        })();
    }, [
        safeContext.safeAuthSignInResponse,
        safeContext.safeAuthSignInResponse?.eoa,
    ]);

    return (
        <PolybaseContext.Provider
            value={{
                user,
                setUser,
                multiSigs,
                setMultiSigs,
                isProfileExists,
                setIsProfileExists,
                loading,
                setLoading,
            }}
        >
            {props.children}
        </PolybaseContext.Provider>
    );
};

export default PolybaseContext;
