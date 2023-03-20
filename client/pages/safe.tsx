import { Layout } from "@/components/Layout";
import { useContext, useEffect, useState } from "react";
import Head from "next/head";
import { Badge, Button, Group, Modal, Skeleton, Text } from "@mantine/core";
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
import { useRouter } from "next/router";
import { getProfile, getSafe } from "@/lib/polybase";
import { CustomSkeleton } from "@/components/CustomSkeleton";
import { useDisclosure } from "@mantine/hooks";
import { OwnersDetails } from "@/components/OwnersDetails";

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
    const [opened, { open, close }] = useDisclosure(false);

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
                setName(safe.name);
                setDescription(safe.description);
                setChainId(safe.chainId);
                setThreshold(safe.threshold);
                setOwners(safe.owners);
                const ownersDetails = await Promise.all(
                    safe.owners.map(async (owner: `0x${string}`) => {
                        const profile = await getProfile(owner);
                        return profile.response.data;
                    })
                );
                setOwnersDetails(ownersDetails);
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
            <CustomSkeleton visible={loading} radius="md" height={"100%"}>
                <h1>{name}</h1>
                <Text size={20} my={"md"} color="dimmed">
                    {description}
                </Text>
                <Group position="center">
                    <Badge
                        variant="gradient"
                        gradient={{ from: "teal", to: "lime", deg: 105 }}
                    >
                        Chain Id: {chainId}
                    </Badge>
                    <Badge
                        variant="gradient"
                        gradient={{ from: "teal", to: "blue", deg: 60 }}
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
                        gradient={{ from: "orange", to: "red" }}
                    >
                        Threshhold: {threshold}
                    </Badge>
                </Group>
            </CustomSkeleton>
            <Modal opened={opened} onClose={close} size="auto" title="Owners">
                <OwnersDetails data={ownersDetails} />
            </Modal>
        </Layout>
    );
}
