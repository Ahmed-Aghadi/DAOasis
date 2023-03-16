import axios from "axios";

interface Profile {
    id: `0x${string}`
    name?: string
    description?: string
    image?: string
}

export const createProfile = async (profile: Profile) => {
    const {id} = profile
    const response = await fetch(`/api/polybase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id, collection: "User"}),
    })
    if(response.status !== 200){
        throw new Error("Error creating profile")
    }
    return response.json()
}

export const updateProfile = async (profile: Profile) => {
    const {id, name} = profile
    const response = await fetch(`/api/polybase`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id, name, description: "", image: "", collection: "User"}),
    })
    if(response.status !== 200){
        throw new Error("Error updating profile")
    }
    return response.json()
}

export const getProfile = async (id: Profile["id"]) => {
    const response = await axios.get(`/api/polybase`, {
        params: {
            id,
            collection: "User"
        }
    })
    if(response.status !== 200){
        throw new Error("Error getting profile")
    }
    return response.data
}