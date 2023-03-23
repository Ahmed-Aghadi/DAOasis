import { Layout } from "@/components/Layout";
import Head from "next/head";
import {
    Anchor,
    Avatar,
    Breadcrumbs,
    Button,
    Center,
    Group,
    Paper,
    Tabs,
    Text,
    Textarea,
    Title,
} from "@mantine/core";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { addReply, getMultiSigProposal } from "@/lib/polybase";
import { StyledTabs } from "@/components/StyledTabs";
import ViewReply from "@/components/ViewReply";
import CreateProposalTxn from "@/components/CreateProposalTxn";
import ProposalAction from "@/components/ProposalActions";
import safeAuthContext from "@/contexts/SafeAuthContext";
import SafeAuthContext from "@/contexts/SafeAuthContext";

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

export type ProposalData = {
    createdAt: string;
    creator: string;
    description: string;
    id: string;
    title: string;
    multiSigId: string;
    replies: {
        collectionId: string;
        id: string;
    }[];
    transactionHash: string;
    chainId?: string;
};

export default function Home() {
    const router = useRouter();
    const [proposalData, setProposalData] = useState<ProposalData>();
    const safeContext = useContext(SafeAuthContext);
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        if (!router.query.id) return;
        getMultiSigProposal(router.query.id as string).then((data) => {
            setProposalData(data.response.data);
        });
    }, [router.query]);

    console.log("proposalData", proposalData);

    const items = [
        {
            title: `${router.query?.name}`,
            href: `/safe?address=${proposalData?.multiSigId}`,
        },
        {
            title: proposalData?.title,
            href: `/proposal?id=${proposalData?.id}&name=${router.query.name}`,
        },
    ].map((item, index) => (
        <Anchor color="#E599F7" href={item.href} key={index}>
            {item.title}
        </Anchor>
    ));

    return (
        <Layout>
            <Head>
                <title>Create Proposal</title>
            </Head>
            <Breadcrumbs>{items}</Breadcrumbs>
            <Title color="#AE3EC9">{proposalData?.title}</Title>
            <Text color="#CC5DE8">{proposalData?.description}</Text>
            <StyledTabs defaultValue="discussions">
                <Tabs.List my={"md"}>
                    <Tabs.Tab value="discussions">Discussions</Tabs.Tab>
                    <Tabs.Tab value="proposals">Contract Proposal</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value={"discussions"}>
                    <form
                        style={{ position: "relative" }}
                        onSubmit={async (e: any) => {
                            e.preventDefault();
                            setSendingReply(true);
                            try {
                                const content = e.target[0].value;
                                const creator =
                                    safeContext.safeAuthSignInResponse?.eoa;
                                const multiSigId = router.query.id as string;
                                const data = await addReply({
                                    collection: "MultiSigProposals",
                                    id: multiSigId,
                                    description: content,
                                    creator: creator!,
                                });
                                setProposalData(data.response.data);
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
                    {proposalData?.replies
                        .slice(0)
                        .reverse()
                        .map((reply, index) => (
                            <ViewReply
                                key={index}
                                collectionId={reply.collectionId}
                                id={reply.id}
                            />
                        ))}
                    {proposalData?.replies.length === 0 && (
                        <Paper my="md" p="md" bg="#e1dbf5" radius="lg">
                            <Text color="#CC5DE8" size="lg">
                                No conversations here yet. Be the first to chat!
                            </Text>
                        </Paper>
                    )}
                </Tabs.Panel>
                <Tabs.Panel value={"proposals"}>
                    <Paper my="md" p="md" bg="#eeebf7" radius="lg">
                        {!proposalData?.transactionHash && (
                            <CreateProposalTxn />
                        )}
                        {proposalData?.transactionHash && (
                            <ProposalAction
                                createdAt={proposalData.createdAt}
                                creator={proposalData.creator}
                                description={proposalData.description}
                                id={proposalData.id}
                                title={proposalData.title}
                                multiSigId={proposalData.multiSigId}
                                replies={proposalData.replies}
                                transactionHash={proposalData.transactionHash}
                                chainId={router?.query?.chainId as string}
                            />
                        )}
                    </Paper>
                </Tabs.Panel>
            </StyledTabs>
        </Layout>
    );
}
