import {CustomSkeleton} from "@/components/CustomSkeleton";
import {
    ActionIcon,
    Avatar,
    Button,
    Center,
    CopyButton,
    Group, Paper,
    ScrollArea,
    Table,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import {IconCopy, IconError404, IconExternalLink} from "@tabler/icons-react";
import {getChainDetails} from "@/lib/getChainDetails";

interface TokenProps {
    loading: boolean;
    txns: any[]
    chainId: string
}

export default function Transactions({loading, txns, chainId}: TokenProps) {
    return (
        <CustomSkeleton visible={loading}>
            <Paper p="xl" bg="#c4b7eb" sx={{height: "100%"}}>
                <Group position={"apart"} mx={"md"} my={"xs"} p={"xs"}>
                    <Title size={"large"} fw={500} color="white">Your Transactions</Title>
                </Group>
                <ScrollArea h={235}>
                    {txns?.length === 0 && (
                        <Center>
                            <div>
                                <Center>
                                    <IconError404 size="142" color="white"/>
                                </Center>
                                <Text color="white" size="xl" mt="md">
                                    You don't have any transactions yet.
                                </Text>
                            </div>
                        </Center>
                    )}
                    {txns?.length > 0 && (
                        <Table ml={"md"} p={"sm"}>
                            <thead>
                            <tr>
                                <th>
                                    <Text style={{color: "white", fontSize: "1rem"}}>
                                        From
                                    </Text>
                                </th>
                                <th>
                                    <Text style={{color: "white", fontSize: "1rem"}}>
                                        To
                                    </Text>
                                </th>
                                <th>
                                    <Text style={{color: "white", fontSize: "1rem"}}>
                                        Value
                                    </Text>
                                </th>
                                <th>
                                    <Text style={{color: "white", fontSize: "1rem"}}>
                                        Explorer Link
                                    </Text>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {txns.map((txn, index) => (
                                    <tr key={index} style={{padding: "10px 0"}}>
                                        <td>
                                            <Group spacing="xs" style={{color: "white", fontSize: "1rem"}}>
                                                {txn.from.slice(0, 4)}...{txn.from.slice(-4)}
                                            </Group>
                                        </td>
                                        <td>
                                            <Text style={{cursor: "pointer", color: "white", fontSize: "1rem"}}>
                                                {txn.to.slice(0, 4)}...{txn.to.slice(-4)}
                                            </Text>
                                        </td>
                                        <td>
                                            <Text style={{cursor: "pointer", color: "white", fontSize: "1rem"}}>
                                                {txn.value ? txn.value : "-"}
                                            </Text>
                                        </td>
                                        <td>
                                            <ActionIcon component={"a"} target={"_blank"}
                                                        href={`${getChainDetails(chainId).explorer}tx/${txn.hash}`}>
                                                <Tooltip label={"View on Explorer"} position="top" withArrow>
                                                    <IconExternalLink color={"teal"} size="1rem"/>
                                                </Tooltip>
                                            </ActionIcon>
                                        </td>
                                    </tr>
                                )
                            )}

                            </tbody>
                        </Table>
                    )}

                </ScrollArea>
            </Paper>
        </CustomSkeleton>
    )
}