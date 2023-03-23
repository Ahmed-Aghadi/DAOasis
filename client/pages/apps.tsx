import {Layout} from "@/components/Layout";
import Head from "next/head";
import {Group, Text, Title} from "@mantine/core";
import Link from "next/link";

export default function Home() {
    return (
        <Layout>
            <Head>
                <title>Apps</title>
            </Head>
            <Group position="apart">
                <Title>Apps</Title>
                <Link href={"/create-app"}>
                    <Text underline color="grape">Create App</Text>
                </Link>
            </Group>
        </Layout>
    )
}