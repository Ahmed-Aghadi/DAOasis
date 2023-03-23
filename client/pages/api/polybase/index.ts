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
import { v4 as uuidv4 } from "uuid";

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

        constructor (id: string) {
            this.id = id;
        }

        function updateRecord (name: string, description: string) {
            this.name = name;
            this.description = description;
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
        threshold: number;
        name: string; 
        description: string;
        chainId: string;

        constructor (id: string, owners: string[], name: string, description: string, threshold: number, chainId: string) {
            this.id = id;
            this.owners = owners;
            this.threshold = threshold;
            this.name = name;
            this.description = description;
            this.chainId = chainId;
        }

        function updateRecord (name: string, description: string) {
            this.name = name;
            this.description = description;
        }

        function updateOwners( newOwners : string[]) {
          this.owners = newOwners;
        }
        
        function updateThreshold( newThreshold : number) {
          this.threshold = newThreshold;
        }
    }

    @public
    collection MultiSigProposals {
        // Multisig Address
        id: string;
        multiSigId: string;
        // Transaction Hash of the safe propposal
        transactionHash?: string;
        title: string; 
        description: string;
        createdAt: string;
        creator: string;
        replies: Reply[];

        constructor (id: string, multiSigId: string, title: string, description: string, createdAt: string, creator: string) {
            this.id = id;
            this.multiSigId = multiSigId;
            this.title = title;
            this.description = description;
            this.createdAt = createdAt;
            this.creator = creator;
            this.replies = [];
        }

        function addTransactionHash (transactionHash: string) {
            this.transactionHash = transactionHash;
        }

        function addReply (reply: Reply) {
            this.replies.push(reply);
        }
    }

    @public
    collection Reply {
        // Multisig Address
        id: string;
        description: string;
        createdAt: string;
        creator: string;

        constructor (id: string, description: string, createdAt: string, creator: string) {
            this.id = id;
            this.description = description;
            this.createdAt = createdAt;
            this.creator = creator;
        }
    }

    @public
    collection App {
        // Multisig Address
        id: string;
        name: string;
        description: string;
        creator: string;
        chainId: string;
        imageCid: string;
        abi: string;
        website: string;
        replies: Reply[];

        constructor (id: string, name: string, description: string, creator: string, chainId: string, imageCid: string, abi: string, website: string) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.creator = creator;
            this.chainId = chainId;
            this.imageCid = imageCid;
            this.abi = abi;
            this.website = website;
            this.replies = [];
        }

        function addReply (reply: Reply) {
            this.replies.push(reply);
        }
    }
`;

const signInPolybase = () => {
    const db = new Polybase({
        defaultNamespace: "polybase-test-v0.0",
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
    const { id } = req.query;
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

    // Create a collection
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
            await handleGet(req, res, userCollection);
        } else if (collection === "Posts") {
            const postsCollection = await db.collection("Posts");
            await handleGet(req, res, postsCollection);
        } else if (collection === "MultiSig") {
            const multiSigCollection = await db.collection("MultiSig");
            await handleGet(req, res, multiSigCollection);
        } else if (collection === "MultiSigProposals") {
            const multiSigProposalsCollection = await db.collection(
                "MultiSigProposals"
            );
            const { id, multiSigId } = req.query;
            if (!id && !multiSigId) {
                const recordData = await multiSigProposalsCollection.get();
                res.status(200).json({ response: recordData });
                return;
            } else if (multiSigId) {
                const recordData = await multiSigProposalsCollection
                    .where("multiSigId", "==", multiSigId as string)
                    .get();
                res.status(200).json({ response: recordData });
                return;
            } else if (id) {
                const recordData = await multiSigProposalsCollection
                    .record(id as string)
                    .get();
                res.status(200).json({ response: recordData });
                return;
            }

            // Get a record
            const recordData = await multiSigProposalsCollection
                .record(id as string)
                .get();
            res.status(200).json({ response: recordData });
        } else if (collection === "Reply") {
            const replyCollection = await db.collection("Reply");
            await handleGet(req, res, replyCollection);
        } else if (collection === "App") {
            const appCollection = await db.collection("App");
            await handleGet(req, res, appCollection);
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
            const { userAddress, body: description } = req.body;
            if (
                !body.hasOwnProperty("userAddress") ||
                !body.hasOwnProperty("body")
            ) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            // Create a record
            const response = await db
                .collection("Posts")
                .create([id as string, userAddress, description]);
            res.status(200).json({ response: response });
        } else if (req.body.collection === "MultiSig") {
            const { owners, name, description, threshold, chainId } = req.body;
            if (
                !body.hasOwnProperty("owners") ||
                !body.hasOwnProperty("name") ||
                !body.hasOwnProperty("description") ||
                !body.hasOwnProperty("threshold") ||
                !body.hasOwnProperty("chainId")
            ) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            // Create a record
            const response = await db
                .collection("MultiSig")
                .create([
                    id as string,
                    owners,
                    name,
                    description,
                    threshold,
                    chainId,
                ]);
            res.status(200).json({ response: response });
        } else if (req.body.collection === "MultiSigProposals") {
            const { title, description, creator } = req.body;
            if (
                !body.hasOwnProperty("title") ||
                !body.hasOwnProperty("description") ||
                !body.hasOwnProperty("creator")
            ) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            const proposalId = uuidv4();
            const createdAt = Date.now();
            // Create a record
            const response = await db
                .collection("MultiSigProposals")
                .create([
                    proposalId as string,
                    id,
                    title,
                    description,
                    createdAt.toString(),
                    creator,
                ]);
            res.status(200).json({ response: response });
            return;
        } else if (req.body.collection === "App") {
            const {
                name,
                description,
                creator,
                chainId,
                imageCid,
                abi,
                website,
            } = req.body;
            if (
                !body.hasOwnProperty("name") ||
                !body.hasOwnProperty("description") ||
                !body.hasOwnProperty("creator") ||
                !body.hasOwnProperty("chainId") ||
                !body.hasOwnProperty("imageCid") ||
                !body.hasOwnProperty("abi") ||
                !body.hasOwnProperty("website")
            ) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            const proposalId = uuidv4();
            // Create a record
            const response = await db
                .collection("App")
                .create([
                    proposalId as string,
                    id,
                    name,
                    description,
                    creator,
                    chainId,
                    imageCid,
                    abi,
                    website,
                ]);
            res.status(200).json({ response: response });
            return;
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
            const { name, description } = body;
            if (
                !body.hasOwnProperty("name") ||
                !body.hasOwnProperty("description")
            ) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            const recordData = await db
                .collection("User")
                .record(id as string)
                .call("updateRecord", [name, description]);
            res.status(200).json({ response: recordData });
            return;
        } else if (req.body.collection === "Posts") {
            const { media, mediaType } = body;
            if (
                !body.hasOwnProperty("media") ||
                !body.hasOwnProperty("mediaType")
            ) {
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
            const { name, description, owners, threshold } = req.body;
            if (body.hasOwnProperty("threshold")) {
                const recordData = await db
                    .collection("MultiSig")
                    .record(id as string)
                    .call("updateThreshold", [threshold]);
                res.status(200).json({ response: recordData });
                return;
            }
            if (body.hasOwnProperty("owners")) {
                const recordData = await db
                    .collection("MultiSig")
                    .record(id as string)
                    .call("updateOwners", [owners]);
                res.status(200).json({ response: recordData });
                return;
            }
            if (
                !body.hasOwnProperty("name") ||
                !body.hasOwnProperty("description")
            ) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            const recordData = await db
                .collection("MultiSig")
                .record(id as string)
                .call("updateRecord", [name, description]);
            res.status(200).json({ response: recordData });
            return;
        } else if (req.body.collection === "MultiSigProposals") {
            const { transactionHash, description, creator } = req.body;
            if (body.hasOwnProperty("transactionHash")) {
                const recordData = await db
                    .collection("MultiSigProposals")
                    .record(id as string)
                    .call("addTransactionHash", [transactionHash]);
                res.status(200).json({ response: recordData });
                return;
            }
            if (
                !body.hasOwnProperty("description") ||
                !body.hasOwnProperty("creator")
            ) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            const replyId = uuidv4();
            const createdAt = Date.now(); // or (new Date()).getTime()
            const replyRecordData = await db
                .collection("Reply")
                .create([
                    replyId as string,
                    description,
                    createdAt.toString(),
                    creator,
                ]);

            const recordData = await db
                .collection("MultiSigProposals")
                .record(id as string)
                .call("addReply", [
                    await db.collection("Reply").record(replyId as string),
                ]);

            res.status(200).json({ response: recordData });
            return;
        } else if (req.body.collection === "App") {
            const { description, creator } = req.body;
            if (
                !body.hasOwnProperty("description") ||
                !body.hasOwnProperty("creator")
            ) {
                res.status(400).json({ response: "Missing required fields" });
                return;
            }
            const replyId = uuidv4();
            const createdAt = Date.now(); // or (new Date()).getTime()
            const replyRecordData = await db
                .collection("Reply")
                .create([
                    replyId as string,
                    description,
                    createdAt.toString(),
                    creator,
                ]);

            const recordData = await db
                .collection("App")
                .record(id as string)
                .call("addReply", [
                    await db.collection("Reply").record(replyId as string),
                ]);

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
