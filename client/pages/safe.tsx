import {Layout} from "@/components/Layout";
import {useContext, useEffect, useState} from "react";
import Head from "next/head";
import {Button, Center, Modal, SimpleGrid,} from "@mantine/core";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import PolybaseContext from "@/contexts/PolybaseContext";
import {ethers} from "ethers";
import {useRouter} from "next/router";
import {getMultiSigProposal, getProfile, getSafe} from "@/lib/polybase";
import {CustomSkeleton} from "@/components/CustomSkeleton";
import {OwnersDetails} from "@/components/OwnersDetails";
import Overview from "@/components/Overview";
import {getRpc} from "@/lib/getRpc";
import CreateProposalModal from "@/components/CreateProposalModal";
import {ProposalData} from "@/pages/proposal";

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
    const [modalOpened, setModalOpened] = useState(false);
    const [proposals, setProposals] = useState<ProposalData>()

    const open = () => {
        setModalOpened(true);
    };

    const modal = (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)} centered radius={"lg"}
               title={"Create Proposal"}
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
               })}
        >
            <CreateProposalModal address={safeAddress} name={name}/>
        </Modal>
    );


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
                console.log("RESPONSE in safe: ", response);
                const safe = response.response.data;
                console.log("SAFE: ", safe);
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
                console.log("OWNERS DETAILS: ", ownersDetails);
                setOwnersDetails(ownersDetails);
                const provider = ethers.getDefaultProvider(
                    getRpc(safe.chainId)
                );
                const balance = ethers.utils.formatEther(
                    await provider.getBalance(safeAddress)
                );
                setBalance(balance);
                const proposals = await getMultiSigProposal(safeAddress);
                console.log("PROPOSALS: ", proposals);
                setProposals(proposals.response.data)
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
                        {maxWidth: 1100, cols: 1},
                        {maxWidth: 1200, cols: 2},
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
                    <Button onClick={open}>
                        Create Proposal
                    </Button>
                </SimpleGrid>
            </Center>
            {modal}
        </Layout>
    );
}
