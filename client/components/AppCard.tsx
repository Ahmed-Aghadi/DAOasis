import {Badge, Card, createStyles, Image, Text} from "@mantine/core";
import {getChainDetails} from "@/lib/getChainDetails";

interface AppCardProps {
    name: string;
    description: string;
    image: string;
    id: string;
    chainId: string;
}

const useStyles = createStyles((theme) => ({
    card: {
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.blueTheme[2],
        height: "100%",
        "&:hover": {
            boxShadow: theme.shadows.lg,
            transform: "translateY(-2px)",
            transition: "all 0.2s ease-in-out",
        }
    },
    title: {
        color: theme.colors.violet[9],
    },
    text: {
        color: theme.colors.violet[5],
    },
    header: {
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 1,
        backgroundColor: theme.colors.blueTheme[5],
        margin: theme.spacing.md,
        color: theme.colors.violet[5],
    }
}))

export default function AppCard({name, id, description, image, chainId}: AppCardProps) {
    const {classes} = useStyles();
    const chain = getChainDetails(chainId)

    return (
        <Card
            shadow="sm"
            component="a"
            href={`/app?id=${id}`}
            padding="xl"
            className={classes.card}
        >
            <Card.Section className={classes.header}>
                <Badge className={classes.badge}>
                    {chain.name}
                </Badge>
                <Image
                    src={`https://${image}.ipfs.nftstorage.link`}
                    alt={name}
                    height={350}
                />
            </Card.Section>
            <Text className={classes.title} weight={500} size="lg" mt="md">
                {name}
            </Text>

            <Text className={classes.text} mt="xs" color="dimmed" lineClamp={2} size="sm">
                {description}
            </Text>
        </Card>
    )
}