import {CustomSkeleton} from "@/components/CustomSkeleton";
import {useContext, useEffect, useState} from "react";
import {
    ActionIcon,
    Avatar,
    Button,
    Center,
    CopyButton,
    Group,
    Modal,
    Paper,
    ScrollArea,
    Table,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import makeBlockie from "ethereum-blockies-base64";
import {IconCopy, IconError404} from "@tabler/icons-react";
import Link from "next/link";
import CreateSafeForm from "@/components/CreateSafeForm";
import PolybaseContext from "@/contexts/PolybaseContext";

export default function SafesOverview() {
    const [loading, setLoading] = useState(true);
    const polybaseContext = useContext(PolybaseContext);
    const [modalOpened, setModalOpened] = useState(false);

    const open = () => {
        setModalOpened(true);
    };

    const modal = (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)} centered radius={"lg"} returnFocus
               title={"Create Safe"}
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
            <CreateSafeForm/>
        </Modal>
    );

    useEffect(() => {
        if (!polybaseContext.multiSigs) return;
        setLoading(false)
    }, [polybaseContext.multiSigs])

    return (
        <CustomSkeleton visible={loading}>
            <Paper p="xl" bg="#c4b7eb" sx={{height: "100%"}}>
                <Group position={"apart"} mx={"md"} my={"xs"} p={"xs"}>
                    <Title size={"large"} fw={500} color="white">Your Safes</Title>
                    <Button variant="light" compact onClick={open} color={"#3304ba"}>
                        Create a new Safe
                    </Button>
                </Group>
                <ScrollArea h={235}>
                    {polybaseContext.multiSigs!.length === 0 && (
                        <Center>
                            <div>
                                <Center>
                                    <IconError404 size="142" color="white"/>
                                </Center>
                                <Text color="white" size="xl" mt="md">
                                    You don't have any Safes yet.
                                </Text>
                            </div>
                        </Center>
                    )}
                    <Table ml={"md"} p={"sm"}>
                        <tbody>
                        {polybaseContext.multiSigs!.map((safe, index) => (
                                <tr key={index} style={{padding: "10px 0"}}>
                                    <td>
                                        <Group spacing="xs">
                                            <Avatar src={makeBlockie(safe.id)} size="lg" radius="xl"/>
                                            <Link href={`/safe?address=${safe.id}`}
                                                  style={{cursor: "pointer", color: "white", fontSize: "1rem"}}>
                                                {safe.name}
                                            </Link>
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