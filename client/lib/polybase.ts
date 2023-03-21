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
    title: string
    description: string
    creator: string
    multiSigId: string
}

interface ProposalReply {
    description: string
    creator: string
    multiSigProposalId: string
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

export const createMultiSigProposal = async ({title, description, creator, multiSigId}: Proposal) => {
    const response = await axios.post(`/api/polybase`, {
        collection: "MultiSigProposals",
        title,
        description,
        creator,
        id: multiSigId
    });
    if (response.status !== 200) {
        throw new Error("Error creating proposal");
    }
    return response.data;
}

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

export const addReply = async ({multiSigProposalId: id, creator, description}: ProposalReply) => {
    const response = await axios.patch(`/api/polybase`, {
        collection: "MultiSigProposals",
        id,
        creator,
        description
    })
    if (response.status !== 200) {
        throw new Error("Error updating proposal");
    }
    return response.data;
}

export const addTxnHash = async (id: string, transactionHash: string) => {
    const response = await axios.patch(`/api/polybase`, {
        collection: "MultiSigProposals",
        id,
        transactionHash
    })
    if (response.status !== 200) {
        throw new Error("Error updating proposal");
    }
    return response.data;
}

export const getProfile = async (id: Profile["id"]) => {
    console.log("id",id)
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
}

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
}