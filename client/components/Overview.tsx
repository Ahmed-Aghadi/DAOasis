import {
    ActionIcon,
    Avatar, Badge,
    Button,
    Container,
    CopyButton,
    Flex,
    Group,
    Paper,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import makeBlockie from "ethereum-blockies-base64";
import {IconCheck, IconCopy, IconExternalLink} from "@tabler/icons-react";
import {CustomSkeleton} from "@/components/CustomSkeleton";
import {getChainDetails} from "@/lib/getChainDetails";

export type OverviewProps = {
    loading: boolean
    address: string
    name: string
    chainId: string
    balance: string
    description?: string
    threshold?: number
    buttonText?: string
    handleClick? : () => void
}

export default function Overview({loading, address, name, chainId, balance, description, threshold, buttonText, handleClick}: OverviewProps) {
    return (
        <CustomSkeleton visible={loading}>
            <Paper p="xl" bg="#c4b7eb" sx={{height: "100%"}}>
                <Group position={"apart"}>
                <Title ml={"md"} p={"sm"} size={"large"} fw={500} color="white">Overview</Title>
                    {threshold && <Badge>Threshold: {threshold}</Badge>}
                </Group>
                <Group position="apart" mx={"md"} my={"sm"} p={"sm"}>
                    <Group>
                        <Avatar src={makeBlockie(address || "0x00")} size="lg"
                                radius="xl"/>
                        <Text color="white">{name}</Text>
                    </Group>
                    <Button radius="lg" sx={{
                        backgroundColor: "#3304ba",
                    }}>
                        <Text>{getChainDetails(chainId).name}</Text>
                    </Button>
                </Group>
                {description && <Text ml={"md"} p={"sm"} color="white">{description}</Text>}
                <Group mx={"md"} my={"sm"} p={"sm"}>
                    <Text color="white">{address}</Text>
                    <CopyButton value={address} timeout={2000}>
                        {({copied, copy}) => (
                            <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="top">
                                <ActionIcon color={copied ? 'teal' : 'white'} onClick={copy}>
                                    {copied ? <IconCheck color={"white"} size="1rem"/> :
                                        <IconCopy color={"teal"} size="1rem"/>}
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </CopyButton>
                    <ActionIcon component={"a"} target={"_blank"}
                                href={`${getChainDetails(chainId).explorer}address/${address}`}>
                        <Tooltip label={"View on Explorer"} position="top" withArrow>
                            <IconExternalLink color={"teal"} size="1rem"/>
                        </Tooltip>
                    </ActionIcon>
                </Group>
                <Group position="apart">
                <Flex direction="column" mx={"md"} my={"sm"} p={"sm"}>
                    <Text color="#E9ECEF">Balance</Text>
                    <Text
                        color="white"><span
                        style={{fontWeight: 700}}>{parseFloat(balance).toFixed(2)}</span> {getChainDetails(chainId).token}
                    </Text>
                </Flex>
                    {buttonText && <Button onClick={handleClick} radius="sm" variant="filled" bg="#D6336C" sx={{
                        "&:hover": {
                            backgroundColor: "#F06595 !important"
                        }
                    }}>
                        {buttonText}
                    </Button>}
                </Group>
            </Paper>
        </CustomSkeleton>
    )
}