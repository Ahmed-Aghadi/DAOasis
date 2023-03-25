import {Layout} from "@/components/Layout";
import React, {useContext, useEffect, useState} from "react";
import Head from "next/head";
import {Button, Center, Modal, Select, SimpleGrid, Text, TextInput} from "@mantine/core";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import PolybaseContext from "@/contexts/PolybaseContext";
import {ethers} from "ethers";
import {useRouter} from "next/router";
import {createMultiSigProposal, getMultiSigProposal, getMultiSigProposals, getProfile, getSafe} from "@/lib/polybase";
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
import {awaitReq} from "@toruslabs/openlogin";
import {enableSafeModule} from "@/lib/safeModule";
import {showNotification} from "@mantine/notifications";

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

    useEffect(() => {
        if (!router.isReady) return;
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
                setLoading(false);
            } catch (error) {
                console.log("ERROR in safe: ", error);
                setIsValid(false);
                setLoading(true)
                alert("Invalid Safe Address")
                router.back()
            }
        })();
    }, [router.isReady]);

    const handleClick = () => {
        setModalOpened(true);
    }

    const form = useForm({
        initialValues: {
            address: "",
            chain: "",
        },
        validate: {
            address: (value) =>
                ethers.utils.isAddress(value!)
                    ? undefined
                    : "Invalid address",
        },
        validateInputOnChange: true,
    });

    const handleSubmit = async (values: { address: string, chain: string }) => {
        setSubmitting(true);
        try {
            const {expectedModuleAddress, safeTransactionData} = enableSafeModule(
                router.query.address as `0x${string}`,
                values.address,
                ethers.getDefaultProvider(getRpc(chainId)),
                values.chain
            );
            const res = await createMultiSigProposal({
                title: "Enable Safe Module",
                description: "By enabling the cross-chain connext-zodiac module, the safe enabled on the other chain will be able to make transactions through the current safe. It will also enable you to send wETH to this safe. If you understand and are comfortable with these risks, you may proceed to enable the cross-chain connext-zodiac module.",
                creator: safeContext.safeAuthSignInResponse?.eoa!,
                multiSigId: router.query.address as `0x${string}`,
            })
            showNotification({
                title: "Success",
                message: "Proposal created successfully",
                color: "green",
            })
            setTimeout(() => {
                setModalOpened(false);
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
            <form onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}>
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
                    Enable Safe Module
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
                        buttonText={"Add Module"}
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
        </Layout>
    );
}
