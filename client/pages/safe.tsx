import {Layout} from "@/components/Layout";
import {useContext, useEffect, useState} from "react";
import Head from "next/head";
import {
    Badge,
    Button,
    Center,
    Group,
    Modal, SimpleGrid,
    Skeleton,
    Text,
} from "@mantine/core";
import CreateSafeForm from "@/components/CreateSafeForm";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import PolybaseContext from "@/contexts/PolybaseContext";
import {ethers} from "ethers";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import Safe from "@safe-global/safe-core-sdk";
import SafeServiceClient from "@safe-global/safe-service-client";
import {getTxService} from "@/lib/getTxService";
import {
    OperationType,
    SafeTransactionDataPartial,
} from "@safe-global/safe-core-sdk-types";
import {useRouter} from "next/router";
import {getProfile, getSafe} from "@/lib/polybase";
import {CustomSkeleton} from "@/components/CustomSkeleton";
import {useDisclosure} from "@mantine/hooks";
import {OwnersDetails} from "@/components/OwnersDetails";
import Overview from "@/components/Overview";

const safeAddress = "0x8Fe5eaba626826BE13097D8902FB5a3D080F14a5";

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
    const [opened, {open, close}] = useDisclosure(false);
    const [balance, setBalance] = useState("0.00");

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
                const ownersDetails = await Promise.all(
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
                const provider = new ethers.providers.Web3Provider(safeContext.safeAuth?.getProvider()!)
                const signer = provider.getSigner()
                const ethAdapter = new EthersAdapter({
                    ethers,
                    signerOrProvider: signer
                })
                const safeSdk = await Safe.create({ ethAdapter, safeAddress })
                const balance = ethers.utils.formatEther(await safeSdk.getBalance())
                setBalance(balance)
            } catch (error) {
                console.log("ERROR in safe: ", error);
                setIsValid(false);
            }
            setLoading(false);
        })();
    }, [router.isReady]);

    return (
        <Layout>
            <Head>
                <title>Safe</title>
            </Head>
            <Center>
                <SimpleGrid cols={2} sx={{width: "85%"}}
                            breakpoints={[
                                {maxWidth: 1100, cols: 1},
                                {maxWidth: 1200, cols: 2},
                            ]}>
                    <Overview loading={loading} address={safeAddress} name={name} chainId={chainId} balance={balance} description={description} threshold={threshold} />
                </SimpleGrid>
            </Center>
            <CustomSkeleton visible={loading} radius="md" height={"100%"}>
                <Center>
                    <h1>{name}</h1>
                </Center>
                <Center>
                    <Text size={20} my={"md"} color="dimmed">
                        {description}
                    </Text>
                </Center>
                <Group position="center">
                    <Badge
                        variant="gradient"
                        gradient={{from: "teal", to: "lime", deg: 105}}
                    >
                        Chain Id: {chainId}
                    </Badge>
                    <Badge
                        variant="gradient"
                        gradient={{from: "teal", to: "blue", deg: 60}}
                        sx={{
                            // on hover
                            "&:hover": {
                                cursor: "pointer",
                                transform: "scale(1.1)",
                            },
                        }}
                        size="lg"
                        onClick={open}
                    >
                        Owners: {owners.length}
                    </Badge>
                    <Badge
                        variant="gradient"
                        gradient={{from: "orange", to: "red"}}
                    >
                        Threshhold: {threshold}
                    </Badge>
                </Group>
            </CustomSkeleton>
            <Modal opened={opened} onClose={close} size="auto" title="Owners">
                <OwnersDetails data={ownersDetails}/>
            </Modal>
        </Layout>
    );
}
