import {CustomSkeleton} from "@/components/CustomSkeleton";
import {useContext, useEffect, useState} from "react";
import {
    ActionIcon,
    Avatar,
    Button,
    CopyButton,
    Flex,
    Group, Modal,
    Paper,
    ScrollArea, Table,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import makeBlockie from "ethereum-blockies-base64";
import {IconCheck, IconCopy, IconExternalLink} from "@tabler/icons-react";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import Link from "next/link";
import CreateSafeForm from "@/components/CreateSafeForm";
import PolybaseContext from "@/contexts/PolybaseContext";

export default function SafesOverview() {
    const [loading, setLoading] = useState(true);
    const safeContext = useContext(SafeAuthContext);
    const polybaseContext = useContext(PolybaseContext);
    const [modalOpened, setModalOpened] = useState(false);

    const open = () => {
        setModalOpened(true);
    };

    const modal = (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)}>
            <CreateSafeForm/>
        </Modal>
    );

    useEffect(() => {
        if(!polybaseContext.multiSigs) return;
        setLoading(false)
    }, [polybaseContext.multiSigs])

    return (
        <CustomSkeleton visible={loading}>
            <Paper p="xl" bg="#c4b7eb">
                <Group position={"apart"} mx={"md"} my={"xs"} p={"xs"}>
                    <Title size={"large"} fw={500} color="white">Your Safes</Title>
                    <Text underline={true} onClick={open} color={"blue"} style={{cursor: "pointer"}}>
                        Create a new Safe
                    </Text>
                </Group>
                <ScrollArea h={235}>
                    <Table ml={"md"} p={"sm"}>
                        <tbody>
                        {polybaseContext.multiSigs!.map((safe, index) => (
                                <tr key={index} style={{padding: "10px 0"}}>
                                    <td>
                                        <Group spacing="xs">
                                            <Avatar src={makeBlockie(safe.id)} size="lg" radius="xl"/>
                                            <Text color="white">{safe.name}</Text>
                                        </Group>
                                    </td>
                                    <td>
                                        <Group px={"xs"} position="apart">
                                            <Link href={`/safe?address=${safe.id}`}
                                                  style={{cursor: "pointer", color: "white", fontSize: "1rem"}}>
                                                {safe.id.slice(0, 10) + "..." + safe.id.slice(-10)}
                                            </Link>
                                            <CopyButton value={safe.id} timeout={2000}>
                                                {({copied, copy}) => (
                                                    <Tooltip label={copied ? "Copied" : "Copy"} position="top">
                                                        <ActionIcon
                                                            onClick={copy}
                                                            color={copied ? "teal" : "white"}
                                                            ml={"md"}
                                                        >
                                                            <IconCopy/>
                                                        </ActionIcon>
                                                    </Tooltip>
                                                )}
                                            </CopyButton>
                                        </Group>
                                    </td>
                                </tr>
                            )
                        )}

                        </tbody>
                    </Table>
                </ScrollArea>
            </Paper>
            {modal}
        </CustomSkeleton>
    )
}