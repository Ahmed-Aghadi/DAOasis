import React, { useEffect, useState } from "react";

type User = {
    id: string;
    name: string;
    description: string;
};

type MultiSig = {
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
});

export const PolybaseContextProvider = (props: any) => {
    const [user, setUser] = useState<User>();
    const [multiSigs, setMultiSigs] = useState<MultiSig[]>([]);

    return (
        <PolybaseContext.Provider
            value={{
                user,
                setUser,
                multiSigs,
                setMultiSigs,
            }}
        >
            {props.children}
        </PolybaseContext.Provider>
    );
};

export default PolybaseContext;
