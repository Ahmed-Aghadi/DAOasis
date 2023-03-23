import {useRouter} from "next/router";
import {useContext, useEffect, useState} from "react";
import {Layout} from "@/components/Layout";
import Head from "next/head";
import {Center, SimpleGrid} from "@mantine/core";
import Overview from "@/components/Overview";
import SafesOverview from "@/components/SafesOverview";
import {ethers} from "ethers";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import {getProfile} from "@/lib/polybase";

export default function User(){
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const safeContext = useContext(SafeAuthContext);
    const [balance, setBalance] = useState("0.00")
    const [profile, setProfile] = useState({name: "", address: "", description: ""})

    useEffect(() => {
        if(!router.query.address) return;
        if(!safeContext.safeAuth) return;
        getBalance()
    }, [router.query])
    const getBalance = async () => {
        const provider = new ethers.providers.Web3Provider(safeContext.safeAuth?.getProvider()!)
        const balance = ethers.utils.formatEther(await provider.getBalance(router.query.address as string))
        console.log("BALANCE: ", balance)
        setBalance(balance)
        setLoading(false)
        const data = await getProfile(router.query.address as `0x${string}`)
        setProfile(data.response.data)
    }

    console.log("PROFILE: ", profile)

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
                    <Overview loading={loading} balance={balance} name={profile?.name!} address={router?.query?.address! as string} chainId={safeContext.safeAuthSignInResponse?.chainId!} />
                    <SafesOverview />
                </SimpleGrid>
            </Center>
        </Layout>
    );
}