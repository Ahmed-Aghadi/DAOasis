import {Layout} from "@/components/Layout";
import Head from "next/head";
import {Center, Grid, Group, Text, Title} from "@mantine/core";
import Link from "next/link";
import {useEffect, useState} from "react";
import {getApps} from "@/lib/polybase";
import AppCard from "@/components/AppCard";

export default function Home() {
    const [appsData, setAppsData] = useState<any>([]);

    useEffect(() => {
        getApps().then((data) => {
            setAppsData(data.response.data)
        })
    }, [])

    return (
        <Layout>
            <Head>
                <title>Apps</title>
            </Head>
            <Group position="apart">
                <Title color="#AE3EC9">Apps</Title>
                <Link href={"/create-app"}>
                    <Text underline color="grape">Create App</Text>
                </Link>
            </Group>
            <Center>
                <Grid gutter="md" m="xs">
                    {appsData?.map((app: any, index: number) => {
                        return (
                            <Grid.Col key={index} xl={4} lg={4} md={6} sm={6}>
                                <AppCard
                                    name={app.data.name}
                                    id={app.data.id}
                                    description={app.data.description}
                                    image={app.data.imageCid}
                                    chainId={app.data.chainId}
                                />
                            </Grid.Col>
                        )
                    })}
                </Grid>
            </Center>
        </Layout>
    )
}