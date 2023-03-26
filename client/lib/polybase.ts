import axios from "axios";

interface Profile {
    id: `0x${string}`;
    name?: string;
    description?: string;
}

interface Safe {
    id: `0x${string}`;
    name?: string;
    description?: string;
    owners?: Profile["id"][];
    threshold?: number;
    chainId: string;
}

interface Proposal {
    title: string;
    description: string;
    creator: string;
    multiSigId: string;
}

interface App {
    id: `0x${string}`;
    name: string;
    description: string;
    creator: string;
    chainId: string;
    imageCid: string;
    abi: string;
    website: string;
}

interface Reply {
    description: string;
    creator: string;
    id: string;
    collection: "MultiSigProposals" | "App";
}

export const createProfile = async (profile: Profile) => {
    const { id } = profile;
    const response = await fetch(`/api/polybase`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, collection: "User" }),
    });
    if (response.status !== 200) {
        throw new Error("Error creating profile");
    }
    return response.json();
};

export const createSafe = async (safe: Safe) => {
    const { id, name, description, owners, threshold, chainId } = safe;
    console.log({
        id,
        collection: "MultiSig",
        name,
        description,
        owners,
        threshold,
        chainId,
    })
    const response = await axios.post(`/api/polybase`, {
        id,
        collection: "MultiSig",
        name,
        description,
        owners,
        threshold,
        chainId,
    });
    if (response.status !== 200) {
        throw new Error("Error creating safe");
    }
    return response.data;
};

export const createMultiSigProposal = async ({
    title,
    description,
    creator,
    multiSigId,
}: Proposal) => {
    const response = await axios.post(`/api/polybase`, {
        collection: "MultiSigProposals",
        title,
        description,
        creator,
        id: multiSigId,
    });
    if (response.status !== 200) {
        throw new Error("Error creating proposal");
    }
    return response.data;
};

export const createApp = async (app: App) => {
    const { id, name, description, creator, chainId, imageCid, abi, website } =
        app;
    const response = await axios.post(`/api/polybase`, {
        collection: "App",
        id,
        name,
        description,
        creator,
        chainId,
        imageCid,
        abi,
        website,
    });

    if (response.status !== 200) {
        throw new Error("Error creating app");
    }
    return response.data;
};

export const updateProfile = async (profile: Profile) => {
    const { id, name } = profile;
    const response = await fetch(`/api/polybase`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, name, description: "", collection: "User" }),
    });
    if (response.status !== 200) {
        throw new Error("Error updating profile");
    }
    return response.json();
};

export const addReply = async ({
    id,
    creator,
    description,
    collection,
}: Reply) => {
    const response = await axios.patch(`/api/polybase`, {
        collection: collection,
        id,
        creator,
        description,
    });
    if (response.status !== 200) {
        throw new Error("Error updating proposal");
    }
    return response.data;
};

export const addTxnHash = async (id: string, transactionHash: string) => {
    const response = await axios.patch(`/api/polybase`, {
        collection: "MultiSigProposals",
        id,
        transactionHash,
    });
    if (response.status !== 200) {
        throw new Error("Error updating proposal");
    }
    return response.data;
};

export const addModule = async (
    moduleAddress: string,
    moduleProposalId: string,
    safeAddress: string
) => {
    const response = await axios.patch(`/api/polybase`, {
        collection: "MultiSig",
        id: safeAddress,
        moduleProposalId,
        moduleAddress,
    });
    if (response.status !== 200) {
        throw new Error("Error adding module");
    }
    return response.data;
};

export const getProfile = async (id: Profile["id"]) => {
    console.log("id", id);
    const response = await axios.get(`/api/polybase`, {
        params: {
            id,
            collection: "User",
        },
    });
    if (response.status !== 200) {
        return new Error("Error getting profile");
    }
    return response.data;
};

export const getAllSafe = async () => {
    const response = await axios.get(`/api/polybase`, {
        params: {
            collection: "MultiSig",
        },
    });
    if (response.status !== 200) {
        throw new Error("Error getting all safe");
    }
    return response.data;
};

export const getSafe = async (id: Safe["id"]) => {
    const response = await axios.get(`/api/polybase`, {
        params: {
            id,
            collection: "MultiSig",
        },
    });
    if (response.status !== 200) {
        throw new Error("Error getting safe");
    }
    return response.data;
};

export const getMultiSigProposal = async (id: string) => {
    const response = await axios.get(`/api/polybase`, {
        params: {
            id,
            collection: "MultiSigProposals",
        },
    });
    if (response.status !== 200) {
        throw new Error("Error getting proposal");
    }
    return response.data;
};

export const getMultiSigProposals = async (multiSigId: string) => {
    const response = await axios.get(`/api/polybase`, {
        params: {
            multiSigId,
            collection: "MultiSigProposals",
        },
    });
    if (response.status !== 200) {
        throw new Error("Error getting proposals");
    }
    return response.data;
};

export const getReply = async (id: string) => {
    const response = await axios.get(`/api/polybase`, {
        params: {
            id,
            collection: "Reply",
        },
    });
    if (response.status !== 200) {
        throw new Error("Error getting reply");
    }
    return response.data;
};

export const getApps = async () => {
    const response = await axios.get(`/api/polybase`, {
        params: {
            collection: "App",
        },
    });
    if (response.status !== 200) {
        throw new Error("Error getting apps");
    }
    return response.data;
};

export const getApp = async (id: string) => {
    const response = await axios.get(`/api/polybase`, {
        params: {
            id,
            collection: "App",
        },
    });
    if (response.status !== 200) {
        throw new Error("Error getting app");
    }
    return response.data;
};
