import { Layout } from "@/components/Layout";
import { useContext, useState } from "react";
import Head from "next/head";
import { Button, Group, Modal } from "@mantine/core";
import CreateSafeForm from "@/components/CreateSafeForm";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import PolybaseContext from "@/contexts/PolybaseContext";
import { ethers } from "ethers";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import Safe from "@safe-global/safe-core-sdk";
import SafeServiceClient from "@safe-global/safe-service-client";
import { getTxService } from "@/lib/getTxService";
import {
    OperationType,
    SafeTransactionDataPartial,
} from "@safe-global/safe-core-sdk-types";
import { enableSafeModule } from "@/lib/safeModule";
import { getRpc } from "@/lib/getRpc";

const safeAddress = "0x8Fe5eaba626826BE13097D8902FB5a3D080F14a5";

export default function Home() {
    const [modalOpened, setModalOpened] = useState(false);
    const safeContext = useContext(SafeAuthContext);
    const userContext = useContext(PolybaseContext);

    const open = () => {
        setModalOpened(true);
    };

    const modal = (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)}>
            <CreateSafeForm />
        </Modal>
    );
    const getSafeService = async () => {
        // Using ethers
        const provider = new ethers.providers.Web3Provider(
            safeContext?.safeAuth?.getProvider()!
        );
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
            txServiceUrl: getTxService("0x5"),
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

    const proposeTransaction = async () => {
        const { signer, safe, service } = await getSafeService();

        // Create transaction
        const safeTransactionData: SafeTransactionDataPartial = {
            to: "0x4CA5FE129837E965e49b507cfE36c0dc574e8864",
            value: ethers.utils.parseEther("0.001").toString(),
            data: "0x",
            operation: OperationType.Call,
        };
        // const safeTransactionData = enableSafeModule(
        //     safeAddress,
        //     "0x289420875bC9d819903bcC656fF9341096a07621",
        //     ethers.getDefaultProvider(getRpc("0x5")),
        //     "0x13881"
        // );
        const safeTransaction = await safe.createTransaction({
            safeTransactionData,
        });

        const senderAddress = await signer.getAddress();
        const safeTxHash = await safe.getTransactionHash(safeTransaction);
        const signature = await safe.signTransactionHash(safeTxHash);

        // Propose transaction to the service
        await service.proposeTransaction({
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
    };

    const getPendingTx = async () => {
        const { safe, service } = await getSafeService();
        const pendingTransactions = (
            await service.getMultisigTransactions(safeAddress)
        ).results;
        console.log("Pending transactions:", pendingTransactions);
        return pendingTransactions;
    };

    const confirmTransaction = async () => {
        const { signer, safe, service } = await getSafeService();
        // Get the transaction
        const transaction = (await getPendingTx())[0];
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
    };

    const executeTransaction = async () => {
        const { safe, service } = await getSafeService();

        // Get the transaction
        const transaction = (await getPendingTx())[0];

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

    return (
        <Layout>
            <Head>
                <title>Safe</title>
            </Head>
            <h1>Safe</h1>
            <button
                onClick={() =>
                    console.log({
                        safeContext,
                        userContext,
                    })
                }
            >
                ConsoleLog
            </button>
            <Group position="center">
                <Button onClick={proposeTransaction}>
                    Propose Transaction
                </Button>
                <Button onClick={getPendingTx}>Get Pending Tx</Button>
                <Button onClick={confirmTransaction}> Confirm Tx</Button>
                <Button onClick={executeTransaction}> Execute Tx</Button>
            </Group>
            {modal}
        </Layout>
    );
}
