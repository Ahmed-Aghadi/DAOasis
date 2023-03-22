import {Layout} from "@/components/Layout";
import {useContext, useEffect, useState} from "react";
import Head from "next/head";
import {Center, SimpleGrid} from "@mantine/core";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import PolybaseContext from "@/contexts/PolybaseContext";
import {ethers} from "ethers";
import Overview from "@/components/Overview";
import SafesOverview from "@/components/SafesOverview";

export default function Dashboard() {
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
                    <Overview loading={loading} balance={balance} name={userContext.user?.name!} address={safeContext.safeAuthSignInResponse?.eoa!} chainId={safeContext.safeAuthSignInResponse?.chainId!} />
                    <SafesOverview />
                </SimpleGrid>
            </Center>
        </Layout>
    );
}
