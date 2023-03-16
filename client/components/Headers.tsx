import { useContext, useState } from "react";
import {
    createStyles,
    Header,
    Container,
    Group,
    Burger,
    Paper,
    Transition,
    rem,
    Text,
    Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import logo from "@/public/logo-wo-bg.png";
import Link from "next/link";
import Image from "next/image";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import Logout from "@/components/Logout";

const HEADER_HEIGHT = rem(95);

const useStyles = createStyles((theme) => ({
    root: {
        backgroundColor: theme.colors.blueTheme[0],
        position: "relative",
        zIndex: 1,
        marginBottom: -76,
    },

    dropdown: {
        position: "absolute",
        top: HEADER_HEIGHT,
        left: 0,
        right: 0,
        zIndex: 0,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        borderTopWidth: 0,
        overflow: "hidden",

        [theme.fn.largerThan("sm")]: {
            display: "none",
        },
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "100%",
    },

    links: {
        [theme.fn.smallerThan("sm")]: {
            display: "none",
        },
    },

    burger: {
        [theme.fn.largerThan("sm")]: {
            display: "none",
        },
    },

    link: {
        display: "block",
        lineHeight: 1,
        padding: `${rem(8)} ${rem(12)}`,
        borderRadius: theme.radius.sm,
        textDecoration: "none",
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[7],
        fontSize: theme.fontSizes.sm,
        fontWeight: 500,

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
        },

        [theme.fn.smallerThan("sm")]: {
            borderRadius: 0,
            padding: theme.spacing.md,
        },
    },

    linkActive: {
        "&, &:hover": {
            backgroundColor: theme.fn.variant({
                variant: "light",
                color: theme.primaryColor,
            }).background,
            color: theme.fn.variant({
                variant: "light",
                color: theme.primaryColor,
            }).color,
        },
    },
}));

const links = [
    {
        link: "/about",
        label: "Features",
    },
    {
        link: "/pricing",
        label: "Pricing",
    },
    {
        link: "/learn",
        label: "Learn",
    },
    {
        link: "/community",
        label: "Community",
    },
];

export function HeaderResponsive() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const [active, setActive] = useState(links[0].link);
    const { classes, cx } = useStyles();
    const ctx = useContext(SafeAuthContext);

    const items = links.map((link) => (
        <Link
            key={link.label}
            href={link.link}
            className={cx(classes.link, {
                [classes.linkActive]: active === link.link,
            })}
            onClick={(event) => {
                event.preventDefault();
                setActive(link.link);
                close();
            }}
        >
            {link.label}
        </Link>
    ));

    return (
        <Header height={HEADER_HEIGHT} className={classes.root}>
            <Container className={classes.header}>
                <Image src={logo} alt={"logo"} width={300} />
                <Group spacing={5} className={classes.links}>
                    {items}
                </Group>
                <Group spacing={5}>
                    <Text color="white" size="sm">
                        {`${ctx.safeAuthSignInResponse?.eoa.slice(
                            0,
                            6
                        )}...${ctx.safeAuthSignInResponse?.eoa.slice(-4)}` ||
                            "Not logged in"}
                    </Text>
                    <Logout />
                </Group>

                <Burger
                    opened={opened}
                    onClick={toggle}
                    className={classes.burger}
                    size="sm"
                />

                <Transition
                    transition="pop-top-right"
                    duration={200}
                    mounted={opened}
                >
                    {(styles) => (
                        <Paper
                            className={classes.dropdown}
                            withBorder
                            style={styles}
                        >
                            {items}
                        </Paper>
                    )}
                </Transition>
            </Container>
        </Header>
    );
}
