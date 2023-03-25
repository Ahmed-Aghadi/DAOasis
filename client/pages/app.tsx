import {Layout} from "@/components/Layout";
import {
    Paper,
    Title,
    Image,
    createStyles,
    Text,
    Group,
    Badge,
    Tooltip,
    ActionIcon,
    Tabs,
    Textarea, Button, Select, TextInput, Center, Container
} from "@mantine/core";
import {useRouter} from "next/router";
import React, {useContext, useEffect, useState} from "react";
import {addReply, addTxnHash, createMultiSigProposal, getApp} from "@/lib/polybase";
import {CustomSkeleton} from "@/components/CustomSkeleton";
import Head from "next/head";
import {getChainDetails} from "@/lib/getChainDetails";
import {IconExternalLink} from "@tabler/icons-react";
import {StyledTabs} from "@/components/StyledTabs";
import ViewReply from "@/components/ViewReply";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import {useForm} from "@mantine/form";
import {ethers} from "ethers";
import {parseAbiToFunction} from "@/lib/abiParse";
import {proposeTransaction} from "@/lib/safeTransactions";
import {showNotification} from "@mantine/notifications";
import PolybaseContext from "@/contexts/PolybaseContext";

const styles = createStyles((theme) => ({
    paper: {
        backgroundColor: theme.colors.blueTheme[5],
    },
    title: {
        bottom: 22,
    },
    text: {
        color: theme.colors.grape[5],
    },
}))

const style = (theme: any) => ({
    input: {
        backgroundColor: theme.colors.blueTheme[3],
        borderRadius: "0.5rem",
        fontSize: "1rem",
        color: theme.colors.blueTheme[5],
        borderColor: theme.colors.blueTheme[3],
        "&:focus": {
            borderColor: "#3304ba",
        },
        "&::placeholder": {
            color: theme.colors.blueTheme[5],
        },
    },
    label: {
        color: theme.colors.blueTheme[4],
    },
});

const selectStyle = (theme: any) => ({
    input: {
        backgroundColor: theme.colors.blueTheme[3],
        borderRadius: "0.5rem",
        color: theme.colors.blueTheme[5],
        borderColor: theme.colors.blueTheme[3],
        "&:focus": {
            borderColor: "#3304ba",
        },
        "&::placeholder": {
            color: theme.colors.blueTheme[5],
        }
    },
    label: {
        color: theme.colors.blueTheme[4],
    },
    dropdown: {
        backgroundColor: theme.colors.blueTheme[3],
        border: "none"
    },
    item: {
        color: theme.colors.blueTheme[5],
        backgroundColor: theme.colors.blueTheme[3],
        '&[data-selected]': {
            '&, &:hover': {
                backgroundColor: theme.colors.blueTheme[0],
            },
        },

        '&[data-hovered]': {
            backgroundColor: theme.colors.blueTheme[2]
        },
    },
})

let abiFunctions: any = [];

export default function Home() {
    const {classes} = styles()
    const router = useRouter()
    const safeContext = useContext(SafeAuthContext)
    const polybaseContext = useContext(PolybaseContext);

    const [appData, setAppData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false)
    const [fetching, setFetching] = useState<boolean>(true)
    const [sendingReply, setSendingReply] = useState<boolean>(false)
    const [selectData, setSelectData] = useState<any>([])
    const [multiSigs, setMultiSigs] = useState<any>([])
    const [selectedFunctionComponent, setSelectedFunctionComponent] = useState<any>(null)

    useEffect(() => {
        if (!router.query.id) return
        getApp(router.query.id as string).then((data) => {
            setAppData(data.response.data)
            setFetching(false)
            const abi = JSON.parse(data.response.data.abi)
            console.log(abi)
            const selectData_ = abi.map((abiFunction: any, index: number) => {
                return {
                    label: `${abiFunction.name}(${abiFunction.inputs.map((input: any) => input.type).join(", ")}) - ${abiFunction.stateMutability}`,
                    value: index,
                }
            })
            abiFunctions = abi
            console.log("abiFunctions", abiFunctions)
            setSelectData(selectData_);
            const multiSigs = polybaseContext.multiSigs.map((multiSig: any) => {
                return {
                    label: `${multiSig.name} (${multiSig.id.slice(0, 4)}...${multiSig.id.slice(-4)}) - ${getChainDetails(multiSig.chain).name}`,
                    value: multiSig.id,
                }
            })
            setMultiSigs(multiSigs)
        })
    }, [router.query, polybaseContext.multiSigs])

    const form = useForm({
        initialValues: {
            functionName: "",
            safeAddress: "",
            value: "0",
            args: [],
        },
        validate: {
            functionName: (value) => handleSelectChange(value) ? undefined : "Select a function",
            value: (value) => /[0-9]*\.[0-9]+/i.test(value) ? "Invalid value" : undefined,
        },
        validateInputOnChange: true,
    })

    const handleSelectChange = (value: any) => {
        if (value === undefined) return false;
        const func = abiFunctions[value];
        const functionComponent = func?.inputs?.map((input: any, index: number) => {
            return (
                <TextInput key={index} my="sm" placeholder={input.type} required
                           label={`${input.name} (${input.type})`} {...form.getInputProps(`args.${index}`)}
                           styles={(theme) => style(theme)}/>
            )
        })
        setSelectedFunctionComponent(functionComponent)
        return true
    }

    const handleProposalSubmit = async (values: any) => {
        setLoading(true)
        console.log(abiFunctions, values.functionName)
        const func = abiFunctions[values.functionName]
        console.log(func)
        let args_ = values.args
        for (let i = 0; i < values.args.length; i++) {
            if (func.inputs[i].type.includes("uint")) {
                args_[i] = parseInt(values.args[i])
            }
        }
        try {
            const res = await createMultiSigProposal({
                title: appData?.name,
                description: `Invoking a function from ${appData?.name}`,
                creator: safeContext.safeAuthSignInResponse?.eoa!,
                multiSigId: values.safeAddress
            })
            console.log(res)
            const iFace = new ethers.utils.Interface([func])
            const data = iFace.encodeFunctionData(func.name, args_)
            console.log("data", data)
            const txHash = await proposeTransaction(safeContext.provider!, values.safeAddress, appData?.chainId as string, appData?.id, values.value, data)
            await addTxnHash(res.response.data.id, txHash)
            setLoading(false)
            setTimeout(() => {
                router.push(`/safe?id=${values.safeAddress}`)
            }, 1500)

        } catch (e: any) {
            console.log(e)
            showNotification({
                title: "Error",
                message: e.message,
                color: "red",
                autoClose: false,
            })
            setLoading(false)
        }
    }


    return (
        <Layout>
            <Head>
                <title>DAOasis - {appData?.name}</title>
            </Head>
            <CustomSkeleton visible={fetching}>
                <Container>
                    <Paper p="xl" className={classes.paper}>
                        <Image
                            mb="md"
                            src={`https://${appData?.imageCid}.ipfs.nftstorage.link`}
                            height={350}
                        />
                        <Group position="apart">
                            <Group>
                                <Title className={classes.title} color="#AE3EC9">
                                    {appData?.name}
                                </Title>
                                <ActionIcon component={"a"} target={"_blank"}
                                            href={appData?.website}>
                                    <Tooltip label={"View App Website"} position="top" withArrow>
                                        <IconExternalLink color={"purple"} size="1rem"/>
                                    </Tooltip>
                                </ActionIcon>
                            </Group>
                            <Badge color="grape" variant="outline">
                                {getChainDetails(appData?.chainId).name}
                            </Badge>
                        </Group>
                    </Paper>
                    <StyledTabs defaultValue="about">
                        <Tabs.List my={"md"} px="md">
                            <Tabs.Tab value="about">About</Tabs.Tab>
                            <Tabs.Tab value="discussions">Discussions</Tabs.Tab>
                            <Tabs.Tab value={"functions"}>Functions</Tabs.Tab>
                        </Tabs.List>
                        <Tabs.Panel value="about">
                            <Paper p="md" className={classes.paper}>
                                <Text className={classes.text} size="xl">
                                    {appData?.description}
                                </Text>
                            </Paper>
                        </Tabs.Panel>
                        <Tabs.Panel value={"discussions"}>
                            <form
                                style={{position: "relative"}}
                                onSubmit={async (e: any) => {
                                    e.preventDefault();
                                    setSendingReply(true);
                                    try {
                                        const content = e.target[0].value;
                                        const creator =
                                            safeContext.safeAuthSignInResponse?.eoa;
                                        const data = await addReply({
                                            collection: "App",
                                            id: router?.query?.id as string,
                                            description: content,
                                            creator: creator!,
                                        });
                                        setAppData(data.response.data);
                                        e.target[0].value = "";
                                    } catch (e) {
                                        console.log(e);
                                    }
                                    setSendingReply(false);
                                }}
                            >
                                <Textarea
                                    placeholder={"What's on Your Mind?"}
                                    required
                                    minRows={5}
                                    styles={(theme) => style(theme)}
                                />
                                <Button
                                    radius="lg"
                                    type="submit"
                                    loading={sendingReply}
                                    sx={(theme) => ({
                                        position: "absolute",
                                        right: "0",
                                        bottom: "0",
                                        margin: theme.spacing.md,
                                        backgroundColor: theme.colors.blueTheme[0],
                                        "&:hover": {
                                            backgroundColor: `${theme.colors.blueTheme[4]} !important`,
                                        },
                                    })}
                                >
                                    Comment
                                </Button>
                            </form>
                            {appData?.replies
                                ?.slice(0)
                                .reverse()
                                .map((reply: { collectionId: string; id: string; }, index: React.Key | null | undefined) => (
                                    <ViewReply
                                        key={index}
                                        collectionId={reply.collectionId}
                                        id={reply.id}
                                    />
                                ))}
                            {appData?.replies?.length === 0 && (
                                <Paper my="md" p="md" bg="#e1dbf5" radius="lg">
                                    <Text color="#CC5DE8" size="lg">
                                        No conversations here yet. Be the first to chat!
                                    </Text>
                                </Paper>
                            )}
                        </Tabs.Panel>
                        <Tabs.Panel value={"functions"}>
                            <Paper p="md" className={classes.paper}>
                                <Group>
                                    <Text className={classes.text} size="xl">
                                        <span style={{fontWeight: "bold"}}>Contract Address: </span>{appData?.id}
                                    </Text>
                                    <ActionIcon component={"a"} target={"_blank"}
                                                href={`${getChainDetails(appData?.chainId!).explorer}address/${appData?.id}`}>
                                        <Tooltip label={"View App Website"} position="top" withArrow>
                                            <IconExternalLink color={"purple"} size="1rem"/>
                                        </Tooltip>
                                    </ActionIcon>
                                </Group>
                                <form onSubmit={form.onSubmit(async (values) => handleProposalSubmit(values))}>
                                    <Select data={multiSigs} placeholder="Select a safe" required searchable
                                            label="Select a safe"
                                            {...form.getInputProps("safeAddress")}
                                            styles={(theme) => selectStyle(theme)}/>
                                    <Select data={selectData} placeholder="Select a function" required searchable
                                            label="Select a function"
                                            {...form.getInputProps("functionName")}
                                            styles={(theme) => selectStyle(theme)}/>
                                    {selectedFunctionComponent}
                                    {selectedFunctionComponent &&
                                        <>
                                            <TextInput my="sm" placeholder="Enter the value" required
                                                       label="Enter the amount you want to send (Leave 0 if no amount has to be sent)" {...form.getInputProps("value")}
                                                       styles={(theme) => style(theme)}/>
                                            <Button loading={loading} fullWidth type="submit" color="red" mt="md"
                                                    styles={(theme) => ({
                                                        root: {
                                                            backgroundColor: theme.colors.violet[6],
                                                            "&:hover": {
                                                                backgroundColor: `${theme.colors.violet[4]} !important`,
                                                                color: `${theme.colors.blueTheme[1]} !important`,
                                                            },
                                                        }
                                                    })}>
                                                Create Proposal
                                            </Button>
                                        </>}
                                </form>
                            </Paper>
                        </Tabs.Panel>
                    </StyledTabs>
                </Container>
            </CustomSkeleton>
        </Layout>
    )
}