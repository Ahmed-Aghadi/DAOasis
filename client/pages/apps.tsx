import {Layout} from "@/components/Layout";
import Head from "next/head";
import {Title} from "@mantine/core";

export default function Home(){
    return (
        <Layout>
            <Head>
                <title>Apps</title>
            </Head>
            <Title>Apps</Title>
        </Layout>
    )
}