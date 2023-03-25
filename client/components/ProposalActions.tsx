import {ProposalData} from "@/pages/proposal";
import {ActionIcon, Button, Group, Paper, Text, Tooltip} from "@mantine/core";
import React, {useContext, useEffect, useState} from "react";
import {getChainDetails} from "@/lib/getChainDetails";
import {IconExternalLink} from "@tabler/icons-react";
import {confirmTransaction, executeTransaction, getPendingTx} from "@/lib/safeTransactions";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import {CustomSkeleton} from "@/components/CustomSkeleton";
import {showNotification, updateNotification} from "@mantine/notifications";
import Link from "next/link";

export default function ProposalAction({transactionHash, chainId, multiSigId}: ProposalData) {
    const safeContext = useContext(SafeAuthContext)
    const chainDetails = getChainDetails(chainId!);
    const [proposalState, setProposalState] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [isConfirming, setIsConfirming] = useState<boolean>(false)
    const [executing, setExecuting] = useState<boolean>(false)

    useEffect(() => {
        if (!transactionHash) return;
        if (!chainId) return;
        if (!multiSigId) return;
        if (!safeContext.provider) return;
        (async () => {
            const proposalStates = await getPendingTx(safeContext.provider!, multiSigId, chainId!)
            const proposal = proposalStates.find((proposal) => proposal.safeTxHash === transactionHash)
            setProposalState(proposal)
            setLoading(false)
        })()
    }, [transactionHash, chainId, multiSigId, safeContext.provider])

    // console.log("proposalState", proposalState)

    const handleConfirmTxn = async () => {
        setIsConfirming(true)
        showNotification({
            id: "confirming",
            title: "Confirming Transaction",
            message: "Please wait while we confirm your transaction",
            loading: true,
            autoClose: false,
        })
        try {
            const signatureRes = await confirmTransaction(safeContext.provider!, multiSigId, chainId!, proposalState)
            console.log("signatureRes", signatureRes)
            updateNotification({
                id: "confirming",
                title: "Transaction Confirmed",
                message: "Your transaction has been confirmed",
                loading: false,
                autoClose: true,
                color: "green"
            })
        } catch (error) {
            console.log("error", error)
            updateNotification({
                id: "confirming",
                title: "Transaction Confirmation Failed",
                message: "Your transaction could not confirmed",
                loading: false,
                autoClose: true,
                color: "red"
            })
        }
        setIsConfirming(false)
    }

    const handleExecuteTxn = async () => {
        if(chainId !== safeContext.safeAuthSignInResponse?.chainId){
            showNotification({
                id: "executing",
                title: "Transaction Execution Failed",
                message: "Your transaction could not executed. You are connected to the wrong network.",
                loading: false,
                autoClose: false,
                color: "red"
            })
            return
        }
        setExecuting(true)
        showNotification({
            id: "executing",
            title: "Executing Transaction",
            message: "Please wait while we execute your transaction",
            loading: true,
            autoClose: false,
        })
        try {
            const url = await executeTransaction(safeContext.provider!, multiSigId, chainId!, proposalState)
            updateNotification({
                id: "executing",
                title: "Transaction Executed",
                message: "Your transaction has been executed. You can view it on " + url,
                loading: false,
                autoClose: true,
                color: "green"
            })
        } catch (error) {
            console.log("error", error)
            updateNotification({
                id: "executing",
                title: "Transaction Execution Failed",
                message: "Your transaction could not executed. Try funding your account with some native token currency and try again.",
                loading: false,
                autoClose: 15000,
                color: "red"
            })
        }
        setExecuting(false)
    }

    return (
        <CustomSkeleton visible={loading}>
            <Paper my="md" p='md' bg="#e1dbf5" radius="lg">
                <Group spacing="md">
                    <Text color="#CC5DE8" size="lg">To: {proposalState?.to}</Text>
                    <ActionIcon component={"a"} target={"_blank"}
                                href={`${chainDetails.explorer}address/${proposalState?.to}`}>
                        <Tooltip label={"View on Explorer"} position="top" withArrow>
                            <IconExternalLink color={"teal"} size="1rem"/>
                        </Tooltip>
                    </ActionIcon>
                </Group>
                <Group spacing="md">
                    <Text color="#CC5DE8" size="lg">Safe Tx Hash: {transactionHash}</Text>
                    <ActionIcon component={"a"} target={"_blank"}
                                href={`${chainDetails.explorer}tx/${transactionHash}`}>
                        <Tooltip label={"View on Explorer"} position="top" withArrow>
                            <IconExternalLink color={"teal"} size="1rem"/>
                        </Tooltip>
                    </ActionIcon>
                </Group>
                <Text color="#CC5DE8" size="lg">Transaction Submitted
                    On: {proposalState?.submissionDate.slice(0, 10)}</Text>
                <Text color="#CC5DE8" size="lg">Confirmations Required: {proposalState?.confirmationsRequired}</Text>
                <Text color="#CC5DE8" size="lg">Confirmations Done: {proposalState?.confirmations.length}</Text>
                {
                    proposalState?.dataDecoded && (
                        <>
                            <Text color="#CC5DE8" size="lg">Method: {proposalState?.dataDecoded.method}</Text>
                            <Text color="#CC5DE8" size="lg" sx={{
                                wordWrap: "break-word",
                            }}>
                                Parameters: {proposalState?.dataDecoded.parameters.map((param: any) => {
                                    return `${param.name}(${param.type}): ${param.value},`
                                }
                            )}
                            </Text>
                        </>
                    )
                }
                {
                    proposalState?.isExecuted && (
                        <>
                            <Text color="#CC5DE8" size="lg">Execution
                                Date: {proposalState?.executionDate.slice(0, 10)}</Text>
                            <Group>
                                <Text color="#CC5DE8" size="lg">Execution Tx
                                    Hash: {proposalState?.transactionHash}</Text>
                                <ActionIcon component={"a"} target={"_blank"}
                                            href={`${chainDetails.explorer}tx/${proposalState?.transactionHash}`}>
                                    <Tooltip label={"View on Explorer"} position="top" withArrow>
                                        <IconExternalLink color={"teal"} size="1rem"/>
                                    </Tooltip>
                                </ActionIcon>
                            </Group>
                            <Text color="#CC5DE8" size="lg">Executor: {proposalState?.executor}</Text>
                        </>
                    )
                }
            </Paper>
            {
                proposalState?.isExecuted && (
                    <>
                        <Button fullWidth color="red" mt="md" styles={(theme) => ({
                            root: {
                                backgroundColor: theme.colors.pink[6],
                                "&:hover": {
                                    backgroundColor: `${theme.colors.pink[4]} !important`,
                                    color: `${theme.colors.blueTheme[1]} !important`,
                                },
                            }
                        })}>
                            <Link href={`${chainDetails.explorer}tx/${proposalState?.transactionHash}`} target="_blank">
                                Proposal Execution {proposalState?.isSuccessful ? "Successful" : "Failed"}
                            </Link>
                        </Button>
                        {!proposalState?.isSuccessful &&
                            <Button loading={executing} fullWidth onClick={handleExecuteTxn} color="red" mt="md"
                                    styles={(theme) => ({
                                        root: {
                                            backgroundColor: theme.colors.pink[6],
                                            "&:hover": {
                                                backgroundColor: `${theme.colors.pink[4]} !important`,
                                                color: `${theme.colors.blueTheme[1]} !important`,
                                            },
                                        }
                                    })}>
                                Execute Proposal
                            </Button>}
                    </>
                )
            }
            {
                !proposalState?.isExecuted && (
                    <>
                        <Button loading={isConfirming} fullWidth onClick={handleConfirmTxn} color="red" mt="md"
                                styles={(theme) => ({
                                    root: {
                                        backgroundColor: theme.colors.violet[6],
                                        "&:hover": {
                                            backgroundColor: `${theme.colors.violet[4]} !important`,
                                            color: `${theme.colors.blueTheme[1]} !important`,
                                        },
                                    }
                                })}>
                            Confirm Proposal
                        </Button>
                        {proposalState?.confirmations.length >= proposalState?.confirmationsRequired &&
                            <Button loading={executing} fullWidth onClick={handleExecuteTxn} color="red" mt="md"
                                    styles={(theme) => ({
                                        root: {
                                            backgroundColor: theme.colors.pink[6],
                                            "&:hover": {
                                                backgroundColor: `${theme.colors.pink[4]} !important`,
                                                color: `${theme.colors.blueTheme[1]} !important`,
                                            },
                                        }
                                    })}>
                                Execute Proposal
                            </Button>
                        }
                    </>
                )
            }
        </CustomSkeleton>
    )
}