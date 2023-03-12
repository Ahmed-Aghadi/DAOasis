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
    response: CollectionList<any> | string;
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
    console.log("req.query", req);

    if (req.method === "GET") {
        const recordData = await db.collection("User").get();
        res.status(200).json({ response: recordData });
    }

    // invalid method
    res.status(400).json({ response: "Invalid method" });
}
