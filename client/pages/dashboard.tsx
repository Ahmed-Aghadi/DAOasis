import {Layout} from "@/components/Layout";
import React, {useContext, useEffect, useState} from "react";
import Head from "next/head";
import {Button, Center, Modal, NumberInput, Select, SimpleGrid, Text, TextInput} from "@mantine/core";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import PolybaseContext from "@/contexts/PolybaseContext";
import {ethers} from "ethers";
import Overview from "@/components/Overview";
import SafesOverview from "@/components/SafesOverview";
import {useForm} from "@mantine/form";
import {enableSafeModule} from "@/lib/safeModule";
import {getRpc} from "@/lib/getRpc";
import {createMultiSigProposal} from "@/lib/polybase";
import {showNotification} from "@mantine/notifications";
import {style} from "@/components/CreateProposalTxn";
import {IconChevronDown} from "@tabler/icons-react";
import {selectStyle} from "@/pages/create-app";

export default function Dashboard() {
    const [balance, setBalance] = useState("0.00")
    const [loading, setLoading] = useState(true)
    const [modalOpened, setModalOpened] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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


    const handleClick = () => {
        setModalOpened(true);
    }

    const form = useForm({
        initialValues: {
            address: "",
            value: "",
        },
        validate: {
            address: (value) =>
                ethers.utils.isAddress(value!)
                    ? undefined
                    : "Invalid address",
        },
        validateInputOnChange: true,
    });

    const handleSubmit = async (values: { address: string, value: string }) => {
        setSubmitting(true);
        try {
            const amount = ethers.utils.parseEther(values.value.toString())
            const provider = new ethers.providers.Web3Provider(safeContext.safeAuth?.getProvider()!)
            const signer = provider.getSigner()
            const tx = await signer.sendTransaction({
                to: values.address,
                value: amount
            })
            console.log("TX: ", tx)
            await tx.wait()
            showNotification({
                title: "Success",
                message: "Fund transfer successful",
                color: "green",
            })
            setTimeout(() => {
                setModalOpened(false);
            }, 1500)
        } catch (error: any) {
            console.log("ERROR in handleSubmit: ", error);
            showNotification({
                title: "Failed",
                message: error.message,
                color: "red",
                autoClose: false,
            })
        }
        setSubmitting(false);
    }

    const modal = (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)} centered radius={"lg"} returnFocus
               title={"Transfer Funds"}
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
            <form onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}>
                <TextInput
                    placeholder={"Address"}
                    label={`Address`} required
                    {...form.getInputProps(`address`)}
                    styles={(theme) => style(theme)}
                />
                <NumberInput step={0.0001}
                    min={0.0} precision={4}
                    placeholder={"Value to send"}
                    label={`Address`} required
                    {...form.getInputProps(`value`)}
                    styles={(theme) => style(theme)}
                />
                <Button loading={submitting} fullWidth type="submit" color="red" mt="md" styles={(theme) => ({
                    root: {
                        backgroundColor: theme.colors.violet[6],
                        "&:hover": {
                            backgroundColor: `${theme.colors.violet[4]} !important`,
                            color: `${theme.colors.blueTheme[1]} !important`,
                        },
                    }
                })}>
                    Transfer
                </Button>
            </form>
        </Modal>
    )
    return (
        <Layout>
            <Head>
                <title>Dashboard</title>
            </Head>
            <Center>
                <SimpleGrid cols={2} sx={{width: "85%"}}
                            breakpoints={[
                                {maxWidth: 1200, cols: 1},
                            ]}
                >
                    <Overview loading={loading} balance={balance} name={userContext.user?.name!} address={safeContext.safeAuthSignInResponse?.eoa!} chainId={safeContext.safeAuthSignInResponse?.chainId!} buttonText={"Send Tokens"} handleClick={handleClick} />
                    <SafesOverview />
                </SimpleGrid>
            </Center>
            {modal}
        </Layout>
    );
}
