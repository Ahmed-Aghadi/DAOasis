import {ethers} from "ethers";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import Safe from "@safe-global/safe-core-sdk";
import SafeServiceClient from "@safe-global/safe-service-client";
import {getTxService} from "@/lib/getTxService";
import {OperationType, SafeTransactionDataPartial} from "@safe-global/safe-core-sdk-types";
import {SafeEventEmitterProvider} from "@web3auth/base";

export const getSafeService = async (provider_: SafeEventEmitterProvider, safeAddress: string, chainId: string) => {
    // Using ethers
    const provider = new ethers.providers.Web3Provider(provider_);
    const signer = provider.getSigner();

    // Create EthAdapter instance
    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
    });

    // Create Safe instance
    const safe = await Safe.create({
        ethAdapter,
        safeAddress,
    });

    // Create Safe Service Client instance
    const service = new SafeServiceClient({
        txServiceUrl: getTxService(chainId),
        ethAdapter,
    });

    console.log("getSafeService", {
        signer,
        safe,
        service,
    });
    return {
        signer,
        safe,
        service,
    };
};

export const proposeTransaction = async ( provider_: SafeEventEmitterProvider, safeAddress: string, chainId: string, to: string, value: string, data: string, operation?: number) => {
    const { signer, safe, service } = await getSafeService(provider_, safeAddress, chainId);

    // Create transaction
    const safeTransactionData: SafeTransactionDataPartial = {
        to: to,
        value: ethers.utils.parseEther(value).toString(),
        data: data,
        operation: OperationType.Call,
    };
    const safeTransaction = await safe.createTransaction({
        safeTransactionData,
    });

    const senderAddress = await signer.getAddress();
    const safeTxHash = await safe.getTransactionHash(safeTransaction);
    const signature = await safe.signTransactionHash(safeTxHash);

    // Propose transaction to the service
    const txHash = await service.proposeTransaction({
        safeAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress,
        senderSignature: signature.data,
    });

    console.log("Proposed a transaction with Safe:", safeAddress);
    console.log("- safeTxHash:", safeTxHash);
    console.log("- Sender:", senderAddress);
    console.log("- Sender signature:", signature.data);
    return safeTxHash;
};

export const getPendingTx = async (provider_: SafeEventEmitterProvider, safeAddress: string, chainId: string) => {
    const { safe, service } = await getSafeService(provider_, safeAddress, chainId);
    const pendingTransactions = (
        await service.getPendingTransactions(safeAddress)
    ).results;
    console.log("Pending transactions:", pendingTransactions);
    return pendingTransactions;
};

export const confirmTransaction = async (provider_: SafeEventEmitterProvider, safeAddress: string, chainId: string) => {
    const { signer, safe, service } = await getSafeService(provider_, safeAddress, chainId);
    // Get the transaction
    const transaction = (await getPendingTx(provider_, safeAddress, chainId))[0];
    // const transactions = await service.getPendingTransactions()
    // const transactions = await service.getIncomingTransactions()
    // const transactions = await service.getMultisigTransactions()
    // const transactions = await service.getModuleTransactions()
    // const transactions = await service.getAllTransactions()

    const safeTxHash = transaction.safeTxHash;
    const signature = await safe.signTransactionHash(safeTxHash);

    // Confirm the Safe transaction
    const signatureResponse = await service.confirmTransaction(
        safeTxHash,
        signature.data
    );

    const signerAddress = await signer.getAddress();
    console.log(
        "Added a new signature to transaction with safeTxGas:",
        safeTxHash
    );
    console.log("- Signer:", signerAddress);
    console.log("- Signer signature:", signatureResponse.signature);
    return signatureResponse;
};

export const executeTransaction = async (provider_: SafeEventEmitterProvider, safeAddress: string, chainId: string) => {
    const { safe, service } = await getSafeService(provider_, safeAddress, chainId);

    // Get the transaction
    const transaction = (await getPendingTx(provider_, safeAddress, chainId))[0];

    const safeTxHash = transaction.safeTxHash;

    // Get the transaction
    const safeTransaction = await service.getTransaction(safeTxHash);
    console.log("safeTransaction", safeTransaction);

    const isTxExecutable = await safe.isValidTransaction(safeTransaction);
    console.log("isTxExecutable", isTxExecutable);

    if (isTxExecutable) {
        // Execute the transaction
        const txResponse = await safe.executeTransaction(safeTransaction);
        const contractReceipt =
            await txResponse.transactionResponse?.wait();

        console.log("Transaction executed.");
        console.log(
            "- Transaction hash:",
            contractReceipt?.transactionHash
        );

        console.log(
            `https://goerli.etherscan.io/tx/${contractReceipt?.transactionHash}`
        );
    } else {
        console.log("Transaction invalid. Transaction was not executed.");
    }
};