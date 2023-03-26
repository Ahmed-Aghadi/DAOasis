import {Layout} from "@/components/Layout";
import React, {useContext, useEffect, useState} from "react";
import Head from "next/head";
import {Button, Center, Modal, Select, SimpleGrid, Text, TextInput} from "@mantine/core";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import PolybaseContext from "@/contexts/PolybaseContext";
import {ethers} from "ethers";
import {useRouter} from "next/router";
import {
    addModule, addTxnHash,
    createMultiSigProposal,
    getMultiSigProposal,
    getMultiSigProposals,
    getProfile,
    getSafe
} from "@/lib/polybase";
import {CustomSkeleton} from "@/components/CustomSkeleton";
import {OwnersDetails} from "@/components/OwnersDetails";
import Overview from "@/components/Overview";
import {getRpc} from "@/lib/getRpc";
import {ProposalData} from "@/pages/proposal";
import {ProposalTable} from "@/components/ProposalTable";
import {useForm} from "@mantine/form";
import {IconChevronDown} from "@tabler/icons-react";
import {selectStyle} from "./create-app";
import {style} from "@/components/CreateProposalTxn";
import myModuleMastercopyDeployment from "@/constants/myModuleMastercopyDeployment.abi.json";
import {enableSafeModule} from "@/lib/safeModule";
import {showNotification} from "@mantine/notifications";
import {getPendingTx, proposeModuleTransaction, proposeTransaction} from "@/lib/safeTransactions";
import {getConnextAddress} from "@/lib/getConnextAddress";
import {getDomainId} from "@/lib/getDomainId";

export default function Home() {
    const safeContext = useContext(SafeAuthContext);
    const userContext = useContext(PolybaseContext);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const safeAddress = router.query.address as `0x${string}`;
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [chainId, setChainId] = useState("");
    const [threshold, setThreshold] = useState(0);
    const [owners, setOwners] = useState<string[]>([]);
    const [ownersDetails, setOwnersDetails] = useState<any[]>([]);
    const [balance, setBalance] = useState("0.00");
    const [proposals, setProposals] = useState<ProposalData[]>()
    const [modalOpened, setModalOpened] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [proposalState, setProposalState] = useState<any>();
    const [originModalOpened, setOriginModalOpened] = useState(false);
    const [moduleAddress, setModuleAddress] = useState("");
    const [proposalId, setProposalId] = useState("");

    useEffect(() => {
        if (!router.isReady) return;
        if (!safeContext.provider) return;
        if (!safeAddress) {
            setLoading(false);
            setIsValid(false);
            return;
        }
        (async () => {
            try {
                const response = await getSafe(safeAddress);
                setIsValid(true);
                const safe = response.response.data;
                setName(safe.name);
                setDescription(safe.description);
                setChainId(safe.chainId);
                setThreshold(safe.threshold);
                setOwners(safe.owners);
                let ownersDetails = await Promise.all(
                    safe.owners.map(async (owner: `0x${string}`) => {
                        try {
                            const profile = await getProfile(owner);
                            return {...profile.response.data, exists: true};
                        } catch (error) {
                            console.log("ERROR in safe: ", error);
                            return {
                                id: owner,
                                name: "-",
                                description: "-",
                                exists: false,
                            };
                        }
                    })
                );
                setOwnersDetails(ownersDetails);
                const provider = ethers.getDefaultProvider(
                    getRpc(safe.chainId)
                );
                const balance = ethers.utils.formatEther(
                    await provider.getBalance(safeAddress)
                );
                setBalance(balance);
                let proposals = await getMultiSigProposals(safeAddress);
                proposals = proposals.response.data.map((proposal: any) => ({
                    title: proposal.data.title,
                    creator: proposal.data.creator,
                    id: proposal.data.id,
                    createdAt: proposal.data.createdAt,
                }))
                setProposals(proposals)
                if (safe.moduleProposalId) {
                    setProposalId(safe.moduleProposalId)
                    setModuleAddress(safe.moduleAddress)
                    const res = await getMultiSigProposal(safe?.moduleProposalId);
                    const proposalStates = await getPendingTx(safeContext.provider!, safeAddress, chainId!)
                    const proposal = proposalStates.find((proposal) => proposal.safeTxHash === res.response.data.transactionHash)
                    setProposalState(proposal)
                }
                setLoading(false);
            } catch (error) {
                console.log("ERROR in safe: ", error);
                setIsValid(false);
                setLoading(true)
                alert("Invalid Safe Address")
                router.back()
            }
        })();
    }, [router.isReady, safeContext.provider, safeAddress]);

    const handleClick = () => {
        if (!proposalState || (proposalState.isSuccessful && !proposalState.isExecuted)) {
            setModalOpened(true);
        } else if (proposalState.isSuccessful) {
            setOriginModalOpened(true)
        } else {
            router.push(`/proposal?id=${proposalId}&name=${name}&address=${safeAddress}&chainId=${chainId}`)
        }
    }

    const form = useForm({
        initialValues: {
            address: "",
            chain: "",
        },
        validate: {
            address: (value) => ethers.utils.isAddress(value!) ? undefined : "Invalid address",
            chain: (value) => value ? undefined : "Invalid chain",
        },
        validateInputOnChange: true,
    });

    const handleSubmit = async (values: { address: string, chain: string }) => {
        console.log("click")
        setSubmitting(true);
        try {
            const {expectedModuleAddress, safeTransactionData} = enableSafeModule(
                router.query.address as `0x${string}`,
                values.address,
                ethers.getDefaultProvider(getRpc(chainId)),
                values.chain
            );
            console.log(expectedModuleAddress)
            const res = await createMultiSigProposal({
                title: "Enable Safe Module",
                description: "By enabling the cross-chain connext-zodiac module, the safe enabled on the other chain will be able to make transactions through the current safe. It will also enable you to send wETH to this safe. If you understand and are comfortable with these risks, you may proceed to enable the cross-chain connext-zodiac module.",
                creator: safeContext.safeAuthSignInResponse?.eoa!,
                multiSigId: router.query.address as `0x${string}`,
            })

            const proposalId = res.response.data.id;
            const addModuleRes = await addModule(expectedModuleAddress, proposalId, safeAddress)

            const txHash = await proposeModuleTransaction(safeContext.provider!, safeAddress, chainId, safeTransactionData)
            await addTxnHash(res.response.data.id, txHash)

            showNotification({
                title: "Success",
                message: "Proposal created successfully",
                color: "green",
            })
            setTimeout(() => {
                router.push(`/proposal?id=${proposalId}&name=${name}&address=${safeAddress}&chainId=${chainId}`)
            }, 1500)
        } catch (error: any) {
            console.log("ERROR in handleSubmit: ", error);
            showNotification({
                title: "Failed",
                message: error.message,
                color: "red",
                autoClose: false,
            })
        }
        setSubmitting(false);
    }

    const handleOriginSubmit = async (values: { address: string, chain: string }) => {
        setSubmitting(true);
        try {
            const res = await createMultiSigProposal({
                title: "Add Origin",
                description: "Adding origin in cross-chain connext-zodiac module.",
                creator: safeContext.safeAuthSignInResponse?.eoa!,
                multiSigId: router.query.address as `0x${string}`,
            })

            const proposalId = res.response.data.id;
            const iFace = new ethers.utils.Interface(myModuleMastercopyDeployment)
            const data = iFace.encodeFunctionData("addOrigin", [getConnextAddress(values.chain), values.address, getDomainId(values.chain)])
            console.log("data", data)
            const txHash = await proposeTransaction(safeContext.provider!, router.query.address as string, router.query.chainId as string, moduleAddress, "0", data)
            const response = await addTxnHash(proposalId, txHash)
            showNotification({
                title: "Success",
                message: "Proposal created successfully",
                color: "green",
            })
            setTimeout(() => {
                router.push(`/proposal?id=${proposalId}&name=${name}&address=${safeAddress}&chainId=${chainId}`)
            }, 1500)
        } catch (error: any) {
            console.log("ERROR in handleSubmit: ", error);
            showNotification({
                title: "Failed",
                message: error.message,
                color: "red",
                autoClose: false,
            })
        }
        setSubmitting(false);
    }

    const modal = (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)} centered radius={"lg"} returnFocus
               title={"Add DAOasis Module"}
               styles={(theme) => ({
                   content: {
                       backgroundColor: theme.colors.blueTheme[2]
                   },
                   title: {
                       fontFamily: "Inter",
                       fontWeight: 600,
                       fontSize: "1.2rem",
                       color: theme.colors.violet[6]
                   },
                   header: {
                       backgroundColor: theme.colors.blueTheme[2],
                       color: theme.colors.violet[6]
                   }
               })}>
            <Text italic color="#FF6B6B" fw={600} mb={"xs"}>
                By enabling the cross-chain connext-zodiac module, the safe enabled on the other chain will be able to
                make transactions through the current safe. It will also enable you to send wETH to this safe. If you
                understand and are comfortable with these risks, you may proceed to enable the cross-chain
                connext-zodiac module.
            </Text>
            <Text italic color="#FF6B6B" fw={600} mb={"xs"}>
                Note: The cross-chain module supports only testnet-testnet and mainnet-mainnet interaction.
            </Text>
            <form onSubmit={form.onSubmit(async (values) => {
                console.log("click")
                await handleSubmit(values)
            })}>
                <TextInput
                    placeholder={"Address of Safe on other chain"}
                    label={`Address`} required
                    {...form.getInputProps(`address`)}
                    styles={(theme) => style(theme)}
                />
                <Select
                    data={[
                        {label: "Gnosis", value: "0x64"},
                        {label: "Goerli", value: "0x5"},
                        {label: "Polygon", value: "0x89"},
                        {label: "Optimism", value: "0xa"},
                    ]}
                    rightSection={<IconChevronDown color="#fff" size="1rem"/>}
                    my="sm" placeholder="Enter the chain ID" required
                    label="Contract Chain ID" {...form.getInputProps("chainId")}
                    styles={(theme) => selectStyle(theme)}/>
                <Button loading={submitting} fullWidth type="submit" color="red" mt="md"
                        onClick={async (event) => {
                            event.preventDefault()
                            console.log("click")
                            form.validate()
                            await handleSubmit(form.values)
                        }
                }
                        styles={(theme) => ({
                            root: {
                                backgroundColor: theme.colors.violet[6],
                                "&:hover": {
                                    backgroundColor: `${theme.colors.violet[4]} !important`,
                                    color: `${theme.colors.blueTheme[1]} !important`,
                                },
                            }
                        })}>
                    Enable Safe Module
                </Button>
            </form>
        </Modal>
    )

    const originModal = (
        <Modal opened={originModalOpened} onClose={() => setOriginModalOpened(false)} centered radius={"lg"} returnFocus
               title={"Add DAOasis Module Origin"}
               styles={(theme) => ({
                   content: {
                       backgroundColor: theme.colors.blueTheme[2]
                   },
                   title: {
                       fontFamily: "Inter",
                       fontWeight: 600,
                       fontSize: "1.2rem",
                       color: theme.colors.violet[6]
                   },
                   header: {
                       backgroundColor: theme.colors.blueTheme[2],
                       color: theme.colors.violet[6]
                   }
               })}>
            <Text italic color="#FF6B6B" fw={600} mb={"xs"}>
                By adding origin in the cross-chain connext-zodiac module, the safe enabled on the other chain will be able to
                make transactions through the current safe. It will also enable you to send wETH to this safe. If you
                understand and are comfortable with these risks, you may proceed to enable the cross-chain
                connext-zodiac module.
            </Text>
            <Text italic color="#FF6B6B" fw={600} mb={"xs"}>
                Note: The cross-chain module supports only testnet-testnet and mainnet-mainnet interaction.
            </Text>
            <form onSubmit={form.onSubmit(async (values) => await handleOriginSubmit(values))}>
                <TextInput
                    placeholder={"Address of Safe on other chain"}
                    label={`Address`} required
                    {...form.getInputProps(`address`)}
                    styles={(theme) => style(theme)}
                />
                <Select
                    data={[
                        {label: "Gnosis", value: "0x64"},
                        {label: "Goerli", value: "0x5"},
                        {label: "Polygon", value: "0x89"},
                        {label: "Optimism", value: "0xa"},
                    ]}
                    rightSection={<IconChevronDown color="#fff" size="1rem"/>}
                    my="sm" placeholder="Enter the chain ID" required
                    label="Contract Chain ID" {...form.getInputProps("chainId")}
                    styles={(theme) => selectStyle(theme)}/>
                <Button loading={submitting} fullWidth type="submit" color="red" mt="md" styles={(theme) => ({
                    root: {
                        backgroundColor: theme.colors.violet[6],
                        "&:hover": {
                            backgroundColor: `${theme.colors.violet[4]} !important`,
                            color: `${theme.colors.blueTheme[1]} !important`,
                        },
                    }
                })}>
                    Add Origin
                </Button>
            </form>
        </Modal>
    )

    return (
        <Layout>
            <Head>
                <title>Safe</title>
            </Head>
            <Center>
                <SimpleGrid
                    cols={2}
                    sx={{width: "85%"}}
                    breakpoints={[
                        {maxWidth: 1200, cols: 1},
                    ]}
                >
                    <Overview
                        loading={loading}
                        address={safeAddress}
                        name={name}
                        chainId={chainId}
                        balance={balance}
                        description={description}
                        threshold={threshold}
                        buttonText={proposalState ? proposalState.isSuccessful ? "Add Origin" : proposalState.isExecuted ? "Add Module" : "Check Module Proposal" : "Add Module"}
                        handleClick={handleClick}
                    />
                    <CustomSkeleton
                        visible={loading}
                        radius="md"
                        height={"100%"}
                    >
                        {!loading && <OwnersDetails data={ownersDetails}/>}
                    </CustomSkeleton>
                </SimpleGrid>
            </Center>
            <Center my={"md"}>
                <SimpleGrid
                    cols={1}
                    sx={{width: "85%"}}
                    breakpoints={[
                        {maxWidth: 1100, cols: 1},
                        {maxWidth: 1200, cols: 2},
                    ]}
                >
                    <CustomSkeleton
                        visible={loading}
                        radius="md"
                        height={"100%"}
                    >
                        {!loading && <ProposalTable data={proposals!} name={name} chainId={chainId}
                                                    safeAddress={router.query.address as string}/>}
                    </CustomSkeleton>
                </SimpleGrid>
            </Center>
            {modal}
            {originModal}
        </Layout>
    );
}
