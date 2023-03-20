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

export default function SafesOverview() {
    const [loading, setLoading] = useState(true);
    const safeContext = useContext(SafeAuthContext);
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
        setTimeout(() => {
            setLoading(false)
        }, 2000)
    }, [])

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
                        {safeContext.safeAuthSignInResponse?.safes!.map((safe, index) => (
                                <tr key={index} style={{padding: "10px 0"}}>
                                    <td>
                                        <Group spacing="xs">
                                            <Avatar src={makeBlockie(safe)} size="lg" radius="xl"/>
                                        </Group>
                                    </td>
                                    <td>
                                        <Group px={"xs"} position="apart">
                                            <Link href={`/safe?address=${safe}`}
                                                  style={{cursor: "pointer", color: "white", fontSize: "1rem"}}>
                                                {safe}
                                            </Link>
                                            <CopyButton value={safe} timeout={2000}>
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