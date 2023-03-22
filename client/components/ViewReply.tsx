import {Avatar, Group, Paper, Text} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {getReply} from "@/lib/polybase";
import * as dayjs from "dayjs"
import relativeTime from 'dayjs/plugin/relativeTime'
import makeBlockie from "ethereum-blockies-base64";

dayjs.extend(relativeTime)

export default function ViewReply({collectionId, id}: { collectionId: string, id: string }) {
    const [replyData, setReplyData] = useState<any>()
    const [time, setTime] = useState("")
    useEffect(() => {
        if (!id) return;
        getReply(id).then((data) => {
            setReplyData(data.response.data)
            const date = dayjs.unix(data.response.data.createdAt * 0.001)
            setTime(date.fromNow())
        })
    }, [id])

    console.log("replyData", replyData)

    return (
        <Paper my="md" p='md' bg="#c4b7eb" radius="lg">
            <Group position="apart" mb="md">
                <Group>
                    <Avatar component="a" href={`/user?address=${replyData?.creator}`} src={makeBlockie(replyData?.creator || "0x00")} size="sm"
                            radius="xl"/>
                    <Text component="a" href={`/user?address=${replyData?.creator}`} color="white" size="xs">{replyData?.creator}</Text>
                </Group>
                <Text size="sm" color="white">{time}</Text>
            </Group>
            <Text color="white" size="lg">{replyData?.description}</Text>
        </Paper>
    )
}