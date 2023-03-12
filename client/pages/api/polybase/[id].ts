// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
    Collection,
    CollectionList,
    CollectionRecordResponse,
    Polybase,
} from "@polybase/client";
import { ethPersonalSign } from "@polybase/eth";
import { ethers } from "ethers";

type Data = {
    response: CollectionList<any> | CollectionRecordResponse<any> | string;
};

const schema = `
    @public
    collection User {
        id: string;
        name?: string; 
        description?: string; 
        image?: string;

        constructor (id: string) {
            this.id = id;
        }

        function updateRecord (name: string, description: string , image: string) {
            this.name = name;
            this.description = description;
            this.image = image;
        }
    }
`;

const signInPolybase = () => {
    const db = new Polybase({
        defaultNamespace: "polybase-test-1234",
    });

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string);

    console.log("PRIVATE_KEY", wallet.privateKey);

    // If you want to edit the contract code in the future,
    // you must sign the request when calling applySchema for the first time
    db.signer((data) => {
        return {
            h: "eth-personal-sign",
            sig: ethPersonalSign(wallet.privateKey as string, data),
        };
    });
    // console.log(db);
    return db;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const db = signInPolybase();

    // Create a collection
    // const createResponse = await db.applySchema(schema);
    // console.log(createResponse);

    if (req.method === "GET") {
        const id = req.query.id;
        // Get a record
        const recordData = await db
            .collection("User")
            .record(id as string)
            .get();
        res.status(200).json({ response: recordData });
    } else if (req.method === "POST") {
        const id = req.query.id;
        // Create a record
        const response = await db.collection("User").create([id as string]);
        // console.log(response);
        res.status(200).json({ response: response });
    } else if (req.method === "PATCH") {
        const id = req.query.id;
        const { name, description, image } = req.body;
        if (!name || !description || !image) {
            res.status(400).json({ response: "Missing required fields" });
            return;
        }
        // Update a record
        const recordData = await db
            .collection("User")
            .record(id as string)
            .call("updateRecord", [name, description, image]);
        res.status(200).json({ response: recordData });
    }

    // invalid method
    res.status(400).json({ response: "Invalid method" });
}
