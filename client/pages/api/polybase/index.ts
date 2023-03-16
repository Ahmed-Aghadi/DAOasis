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
        // user publicAddress
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

    @public
    collection Posts {
        // Crypto UUID or Multisig TransactionHash for proposal discussions
        id: string;
        // publicKey
        userAddress: string;
        body: string; 
        media?: string;
        mediaType?: string;
      
        constructor (id: string, userAddress: string, body: string) {
            this.id = id;
            this.userAddress = userAddress;
            this.body = body;
        }

        function updateRecord (media: string, mediaType: string) {
            this.media = media;
            this.mediaType = mediaType;
        }
    }

    @public
    collection MultiSig {
        // multiSig public address
        id: string;
        owners: string[];
        name?: string; 
        description?: string; 
        image?: string;

        constructor (id: string, owners: string[], name: string, description: string, image: string) {
            this.id = id;
            this.owners = owners;
            this.name = name;
            this.description = description;
            this.image = image;
        }

        function updateRecord (name: string, description: string , image: string) {
            this.name = name;
            this.description = description;
            this.image = image;
        }

        function updateOwners( newOwners : string[]) {
          this.owners = newOwners;
        }
    }

    @public
    collection MultiSigProposals {
        // Multisig Address
        id: string;
        // Transaction Hash of the safe propposal
        proposalHash: string;
        name: string; 
        description: string; 
        image: string;

        constructor (id: string, proposalHash: string, name: string, description: string, image: string) {
            this.id = id;
            this.proposalHash = proposalHash;
            this.name = name;
            this.description = description;
            this.image = image;
        }

        function updateRecord (name: string, description: string, image: string) {
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

    // console.log("PRIVATE_KEY", wallet.privateKey);

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

async function handleGet(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
    collection: Collection<any>
) {
    const { id } = req.body;
    if (!id) {
        const recordData = await collection.get();
        res.status(200).json({ response: recordData });
        return;
    }
    // Get a record
    const recordData = await collection.record(id as string).get();
    res.status(200).json({ response: recordData });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const db = signInPolybase();

    // // Create a collection
    // const createResponse = await db.applySchema(schema);
    // console.log(createResponse);

    const body = req.body;
    const params = req.query;
    if (req.method === "GET") {
        if (!params || Object.keys(params).length === 0) {
            res.status(400).json({ response: "Missing query params" });
            return;
        }
    } else if (req.method === "POST" || req.method === "PATCH") {
        if (!body || Object.keys(body).length === 0) {
            res.status(400).json({ response: "Missing body" });
            return;
        }
    }
    if (req.method === "GET") {
        const { collection } = params;
        if (!collection) {
            res.status(400).json({
                response: "Missing required field 'collection'",
            });
            return;
        }
        if (collection === "User") {
            const userCollection = await db.collection("User");
            handleGet(req, res, userCollection);
        } else if (collection === "Posts") {
            const postsCollection = await db.collection("Posts");
            handleGet(req, res, postsCollection);
        } else if (collection === "MultiSig") {
            const multiSigCollection = await db.collection("MultiSig");
            handleGet(req, res, multiSigCollection);
        } else if (collection === "MultiSigProposals") {
            const multiSigProposalsCollection = await db.collection(
                "MultiSigProposals"
            );
            handleGet(req, res, multiSigProposalsCollection);
        } else {
            res.status(400).json({ response: "Invalid collection" });
        }
        return;
    } else if (req.method === "POST") {
        const { id } = body;
        if (!id) {
            res.status(400).json({ response: "Missing required field 'id'" });
            return;
        }

        if (req.body.collection === "User") {
            // Create a record
            const response = await db.collection("User").create([id as string]);
            res.status(200).json({ response: response });
        } else if (req.body.collection === "Posts") {
            const { userAddress, body } = req.body;
            if (!userAddress || !body) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            // Create a record
            const response = await db
                .collection("Posts")
                .create([id as string, userAddress, body]);
            res.status(200).json({ response: response });
        } else if (req.body.collection === "MultiSig") {
            const { owners, name, description, image } = req.body;
            if (!owners || !name || !description || !image) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            // Create a record
            const response = await db
                .collection("MultiSig")
                .create([id as string, owners, name, description, image]);
            res.status(200).json({ response: response });
        } else if (req.body.collection === "MultiSigProposals") {
            const { proposalHash, name, description, image } = req.body;
            if (!proposalHash || !name || !description || !image) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            // Create a record
            const response = await db
                .collection("MultiSigProposals")
                .create([id as string, proposalHash, name, description, image]);
            res.status(200).json({ response: response });
        } else {
            res.status(400).json({ response: "Invalid collection" });
            return;
        }
    } else if (req.method === "PATCH") {
        const { id } = body;
        if (!id) {
            res.status(400).json({ response: "Missing required field 'id'" });
            return;
        }
        if (req.body.collection === "User") {
            const { name, description, image } = req.body;
            if (!name || !description || !image) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            const recordData = await db
                .collection("User")
                .record(id as string)
                .call("updateRecord", [name, description, image]);
            res.status(200).json({ response: recordData });
            return;
        } else if (req.body.collection === "Posts") {
            const { media, mediaType } = req.body;
            if (!media || !mediaType) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            const recordData = await db
                .collection("Posts")
                .record(id as string)
                .call("updateRecord", [media, mediaType]);
            res.status(200).json({ response: recordData });
            return;
        } else if (req.body.collection === "MultiSig") {
            const { name, description, image } = req.body;
            if (!name || !description || !image) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            const recordData = await db
                .collection("MultiSig")
                .record(id as string)
                .call("updateRecord", [name, description, image]);
            res.status(200).json({ response: recordData });
            return;
        } else if (req.body.collection === "MultiSigProposals") {
            const { name, description, image } = req.body;
            if (!name || !description || !image) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            const recordData = await db
                .collection("MultiSigProposals")
                .record(id as string)
                .call("updateRecord", [name, description, image]);
            res.status(200).json({ response: recordData });
            return;
        } else {
            res.status(400).json({ response: "Invalid collection" });
            return;
        }
    }

    // invalid method
    res.status(400).json({ response: "Invalid method" });
}
