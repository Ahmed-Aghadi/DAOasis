import {getRpc} from "@/lib/getRpc";
import {ethers} from "ethers";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import {SafeAccountConfig, SafeDeploymentConfig, SafeFactory} from "@safe-global/safe-core-sdk";

interface Config {
    DEPLOYER_ADDRESS_PRIVATE_KEY: string
    DEPLOY_SAFE: {
        SALT_NONCE: string
    }
}

const config: Config = {
    DEPLOYER_ADDRESS_PRIVATE_KEY: process.env.NEXT_PUBLIC_PRIVATE_KEY as string,
    DEPLOY_SAFE: {
        SALT_NONCE: Math.floor(Math.random() * 9999).toString()
    }
}

export const safeCreate = async (owners: string[], threshold: number, chainId: string) => {
    const rpc = getRpc(chainId)
    const provider = new ethers.providers.JsonRpcProvider(rpc)
    const deployerSigner = new ethers.Wallet(config.DEPLOYER_ADDRESS_PRIVATE_KEY, provider)

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

    return safe.getAddress()
}