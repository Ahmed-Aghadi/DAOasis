import { SafeAccountConfig, SafeDeploymentConfig, SafeFactory } from '@safe-global/safe-core-sdk'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import { ethers } from 'ethers'
import {NextApiRequest, NextApiResponse} from "next";

interface Config {
    RPC_URL: string
    DEPLOYER_ADDRESS_PRIVATE_KEY: string
    DEPLOY_SAFE: {
        SALT_NONCE: string
    }
}

const config: Config = {
    RPC_URL: process.env.RPC_URL as string,
    DEPLOYER_ADDRESS_PRIVATE_KEY: process.env.PRIVATE_KEY as string,
    DEPLOY_SAFE: {
        SALT_NONCE: '1'
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {owners, threshold} = req.body as {owners: string[], threshold: number}
    const provider = new ethers.providers.JsonRpcProvider(config.RPC_URL)
    const deployerSigner = new ethers.Wallet(config.DEPLOYER_ADDRESS_PRIVATE_KEY, provider)

    console.log("Owners:", owners)

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: deployerSigner
    })

    // Create SafeFactory instance
    const safeFactory = await SafeFactory.create({ ethAdapter })

    // Config of the deployed Safe
    const safeAccountConfig: SafeAccountConfig = {
        owners: owners,
        threshold: threshold
    }
    const safeDeploymentConfig: SafeDeploymentConfig = {
        saltNonce: config.DEPLOY_SAFE.SALT_NONCE
    }

    // Predict deployed address
    const predictedDeployAddress = await safeFactory.predictSafeAddress({
        safeAccountConfig,
        safeDeploymentConfig
    })

    function callback(txHash: string) {
        console.log('Transaction hash:', txHash)
    }

    // Deploy Safe
    const safe = await safeFactory.deploySafe({
        safeAccountConfig,
        safeDeploymentConfig,
        callback
    })

    console.log('Predicted deployed address:', predictedDeployAddress)
    console.log('Deployed Safe:', safe.getAddress())

    res.status(200).json({address: safe.getAddress()})
}