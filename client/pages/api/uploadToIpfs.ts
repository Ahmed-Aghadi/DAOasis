import {NextApiRequest, NextApiResponse} from "next"
import {NFTStorage, File} from "nft.storage"

type Data = {
    cid: any
}

function getAccessToken() {
    return process.env.NFT_STORAGE_API_KEY
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method === "POST") {
        let file: File
        const {name, description, filesData, type} = req.body
        let _file = Buffer.from(filesData[0].buffer.data);
        file = new File([_file], name, {type: `${type}/*`})

        console.log("file:", file)

        const endpoint = "https://api.nft.storage"
        const token = getAccessToken()
        // @ts-ignore
        const client = new NFTStorage({endpoint, token})
        const cid = await client.storeBlob(file!)
        console.log(cid)
        res.status(200).json({"cid": cid})
    }
}
