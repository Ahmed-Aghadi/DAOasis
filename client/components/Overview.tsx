import {
    ActionIcon,
    Avatar,
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
import {useContext, useEffect, useState} from "react";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import PolybaseContext from "@/contexts/PolybaseContext";
import {ethers} from "ethers";
import makeBlockie from "ethereum-blockies-base64";
import {IconCheck, IconCopy, IconExternalLink} from "@tabler/icons-react";
import {CustomSkeleton} from "@/components/CustomSkeleton";

export default function Overview() {
    const [balance, setBalance] = useState("0.00")
    const [loading, setLoading] = useState(true)

    const safeContext = useContext(SafeAuthContext);
    const userContext = useContext(PolybaseContext);

    useEffect(() => {
        if (!safeContext.safeAuth) return;
        getBalance()
    }, [safeContext.safeAuth])

    const getBalance = async () => {
        const provider = new ethers.providers.Web3Provider(safeContext.safeAuth?.getProvider()!)
        const signer = provider.getSigner()
        const balance = ethers.utils.formatEther(await signer.getBalance())
        console.log("BALANCE: ", balance)
        setBalance(balance)
        setLoading(false)
    }

    return (
        <CustomSkeleton visible={loading}>
            <Paper p="xl" bg="#c4b7eb">
                <Title ml={"md"} p={"sm"} size={"large"} fw={500} color="white">Overview</Title>
                <Group position="apart" mx={"md"} my={"sm"} p={"sm"}>
                    <Group>
                        <Avatar src={makeBlockie(safeContext.safeAuthSignInResponse?.eoa || "0x00")} size="lg"
                                radius="xl"/>
                        <Text color="white">{userContext.user?.name}</Text>
                    </Group>
                    <Button radius="lg">
                        <Text>{getChainDetails(safeContext.safeAuthSignInResponse?.chainId!).name}</Text>
                    </Button>
                </Group>
                <Group mx={"md"} my={"sm"} p={"sm"}>
                    <Text color="white">{safeContext.safeAuthSignInResponse?.eoa}</Text>
                    <CopyButton value={safeContext.safeAuthSignInResponse?.eoa!} timeout={2000}>
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
                                href={`${getChainDetails(safeContext.safeAuthSignInResponse?.chainId!).explorer}${safeContext.safeAuthSignInResponse?.eoa}`}>
                        <Tooltip label={"View on Etherscan"} position="top" withArrow>
                            <IconExternalLink color={"teal"} size="1rem"/>
                        </Tooltip>
                    </ActionIcon>
                </Group>
                <Flex direction="column" mx={"md"} my={"sm"} p={"sm"}>
                    <Text color="#E9ECEF">Balance</Text>
                    <Text
                        color="white"><span style={{fontWeight: 700}}>{parseFloat(balance).toFixed(2)}</span> {getChainDetails(safeContext.safeAuthSignInResponse?.chainId!).token}</Text>
                </Flex>
            </Paper>
        </CustomSkeleton>
    )
}

const getChainDetails = (chainId: string) => {
    switch (chainId) {
        case "0x64":
            return {
                name: "Gnosis",
                token: "XDAI",
                explorer: "https://gnosisscan.io/address/"
            }
        case "0x89":
            return {
                name: "Polygon",
                token: "MATIC",
                explorer: "https://polygonscan.com/address/"
            }
        case "0x5":
            return {
                name: "Goerli",
                token: "GoerliETH",
                explorer: "https://goerli.etherscan.io/address/"
            }
        case "0xa":
            return {
                name: "Optimism",
                token: "ETH",
                explorer: "https://optimistic.etherscan.io/address/"
            }
        default:
            return {
                name: "Goerli",
                token: "GoerliETH",
                explorer: "https://goerli.etherscan.io/address/"
            }
    }
}