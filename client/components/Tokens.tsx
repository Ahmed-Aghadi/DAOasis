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
import {IconCopy, IconError404} from "@tabler/icons-react";

interface TokenProps {
    loading: boolean;
    tokens: { name: string, symbol: string, balance: string }[] | []
}

export default function Tokens({loading, tokens}: TokenProps) {
    return (
        <CustomSkeleton visible={loading}>
            <Paper p="xl" bg="#c4b7eb" sx={{height: "100%"}}>
                <Group position={"apart"} mx={"md"} my={"xs"} p={"xs"}>
                    <Title size={"large"} fw={500} color="white">Your Tokens</Title>
                </Group>
                <ScrollArea h={235}>
                    {tokens?.length === 0 && (
                        <Center>
                            <div>
                                <Center>
                                    <IconError404 size="142" color="white"/>
                                </Center>
                                <Text color="white" size="xl" mt="md">
                                    You don't have any tokens yet.
                                </Text>
                            </div>
                        </Center>
                    )}
                    {tokens?.length > 0 && (
                        <Table ml={"md"} p={"sm"}>
                            <thead>
                            <tr>
                                <th>
                                    <Text style={{color: "white", fontSize: "1rem"}}>
                                        Name
                                    </Text>
                                </th>
                                <th>
                                    <Text style={{color: "white", fontSize: "1rem"}}>
                                        Balance
                                    </Text>
                                </th>
                                <th>
                                    <Text style={{color: "white", fontSize: "1rem"}}>
                                        Symbol
                                    </Text>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {tokens.map((token, index) => (
                                    <tr key={index} style={{padding: "10px 0"}}>
                                        <td>
                                            <Group spacing="xs" style={{color: "white", fontSize: "1rem"}}>
                                                {token.name}
                                            </Group>
                                        </td>
                                        <td>
                                            <Text style={{cursor: "pointer", color: "white", fontSize: "1rem"}}>
                                                {token.balance}
                                            </Text>
                                        </td>
                                        <td>
                                            <Text style={{cursor: "pointer", color: "white", fontSize: "1rem"}}>
                                                {token.symbol}
                                            </Text>
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