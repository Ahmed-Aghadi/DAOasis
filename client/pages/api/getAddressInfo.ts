import {NextApiRequest, NextApiResponse} from "next"
import {Alchemy, Network} from "alchemy-sdk"
import axios from "axios";

type Data = {
    tokens: { name: string, balance: string, symbol: string }[],
    incomingTxn?: any,
    outgoingTxn?: any
}

const getConfig = (chainId: string) => {
    switch (chainId) {
        case "0x89":
            return {
                apiKey: process.env.ALCHEMY_POLYGON_API_KEY,
                network: Network.MATIC_MAINNET
            }
        case "0x5":
            return {
                apiKey: process.env.ALCHEMY_GOERLI_API_KEY,
                network: Network.ETH_GOERLI
            }
        case "0xa":
            return {
                apiKey: process.env.ALCHEMY_OPTIMISM_API_KEY,
                network: Network.OPT_MAINNET
            }
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const {address, chainId} = req.body
    if (chainId !== "0x64") {
        const config = getConfig(chainId)
        const alchemy = new Alchemy(config)

        const balances = await alchemy.core.getTokenBalances(address);
        const nonZeroBalances = balances.tokenBalances.filter((token) => {
            return token.tokenBalance !== "0";
        });

        const resultBalance: { name: string, balance: string, symbol: string }[] = []

        // Counter for SNo of final output
        let i = 1;

        // Loop through all tokens with non-zero balance
        for (let token of nonZeroBalances) {
            // Get balance of token
            let balance = parseInt(token.tokenBalance!);

            // Get metadata of token
            const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);

            // Compute token balance in human-readable format
            if (typeof metadata.decimals === "number") {
                balance = balance / Math.pow(10, metadata.decimals);
            }
            balance = parseInt(balance.toFixed(2))

            resultBalance.push({
                name: metadata.name!,
                balance: balance.toString(),
                symbol: metadata.symbol!
            })
        }

        // @ts-ignore
        const outgoingTxn = await alchemy.core.getAssetTransfers({
            fromAddress: address,
            fromBlock: "0x0",
            category: ["external", "internal", "erc20", "erc721", "erc1155"],
        })

        // @ts-ignore
        const incomingTxn = await alchemy.core.getAssetTransfers({
            toAddress: address,
            fromBlock: "0x0",
            category: ["external", "internal", "erc20", "erc721", "erc1155"],
        })

        res.send({
            tokens: resultBalance,
            incomingTxn: incomingTxn.transfers,
            outgoingTxn: outgoingTxn.transfers
        })
    }
    if (chainId === "0x64") {
        const transactions = await axios.get(`https://api.gnosisscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.GNOSIS_SCAN_API_KEY}`)
        console.log(transactions)
        res.send({
            tokens: [],
            incomingTxn: transactions.data.result,
        })
    }
}