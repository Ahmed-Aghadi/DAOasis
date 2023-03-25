import React, {useContext, useState} from "react";
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
    Menu,
    UnstyledButton, Avatar, Tooltip,
} from "@mantine/core";
import {useClipboard, useDisclosure} from "@mantine/hooks";
import logo from "@/public/img.png";
import Link from "next/link";
import Image from "next/image";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import Logout from "@/components/Logout";
import {IconChevronDown, IconCopy, IconLogout, IconMessage} from "@tabler/icons-react";
import PolybaseContext from "@/contexts/PolybaseContext";
import makeBlockie from "ethereum-blockies-base64";
import {useRouter} from "next/router";
import ChainSelect from "@/components/ChainSelect";

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
        width: "100%",
        maxWidth: "100%",
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
        color: theme.colors.blueTheme[1],
        fontSize: theme.fontSizes.sm,
        fontWeight: 500,

        "&:hover": {
            backgroundColor: theme.colors.blueTheme[3]
        },

        [theme.fn.smallerThan("sm")]: {
            borderRadius: 0,
            padding: theme.spacing.md,
        },
    },

    linkActive: {
        "&, &:hover": {
            backgroundColor: theme.colors.blueTheme[4],
            color: theme.colors.blueTheme[1],
        },
    },
    user: {
        color: theme.white,
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        borderRadius: theme.radius.sm,
        transition: 'background-color 100ms ease',

        '&:hover': {
            backgroundColor: theme.fn.lighten(
                theme.colors.blueTheme[4],
                0.1
            ),
        },

        [theme.fn.smallerThan('xs')]: {
            display: 'none',
        },
    },

    userActive: {
        backgroundColor: theme.fn.lighten(
            theme.colors.blueTheme[0],
            0.1
        ),
    },
}));

const links = [
    {
        link: "/dashboard",
        label: "Dashboard",
    },
    {
        link: "/apps",
        label: "Explore Apps",
    },
];

export function HeaderResponsive() {
    const [opened, {toggle, close}] = useDisclosure(false);
    const clipboard = useClipboard()
    const router = useRouter();
    const [active, setActive] = useState(router.pathname);
    const {classes, theme, cx} = useStyles();
    const safeContext = useContext(SafeAuthContext);
    const polybaseContext = useContext(PolybaseContext);
    const [userMenuOpened, setUserMenuOpened] = useState(false);

    const MenuDropdown = (
        <Menu width={260} position="bottom-end" transitionProps={{transition: 'pop-top-right'}} closeOnItemClick={false}
              onClose={() => setUserMenuOpened(false)} onOpen={() => setUserMenuOpened(true)} withinPortal>
            <Menu.Target>
                <UnstyledButton
                    className={cx(classes.user, {[classes.userActive]: userMenuOpened})}
                >
                    <Group spacing={7}>
                        <Avatar src={makeBlockie(safeContext.safeAuthSignInResponse?.eoa || "0x00000")} alt={"pfp"}
                                radius="xl" size={20}/>
                        <Text weight={500} size="sm" sx={{lineHeight: 1, color: theme.white}} mr={3}>
                            {polybaseContext.user?.name}
                        </Text>
                        <IconChevronDown size={rem(12)} stroke={1.5}/>
                    </Group>
                </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
                <Tooltip label={"Copy your address"} position={"top"}>
                    <Menu.Item
                        icon={<IconCopy size="0.9rem" stroke={1.5} color={theme.colors.red[6]}/>}
                        onClick={() => {
                            clipboard.copy(safeContext.safeAuthSignInResponse?.eoa)
                        }}
                    >
                        {clipboard.copied ? 'Copied' : `${safeContext.safeAuthSignInResponse?.eoa.slice(0, 12)}...${safeContext.safeAuthSignInResponse?.eoa.slice(-11)}`}
                    </Menu.Item>
                </Tooltip>
                <Menu.Item>
                    <ChainSelect/>
                </Menu.Item>
                <Menu.Item
                    icon={<IconLogout size="0.9rem" stroke={1.5} color={theme.colors.gray[7]}/>}
                >
                    <Logout/>
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>)

    const items = links.map((link) => (
        <Link
            key={link.label}
            href={link.link}
            className={cx(classes.link, {
                [classes.linkActive]: active === link.link,
            })}
        >
            {link.label}
        </Link>
    ));

    return (
        <Header height={HEADER_HEIGHT} className={classes.root}>
            <Container className={classes.header}>
                <div style={{width: "7rem"}}>
                    <Link href="/">
                        <Image src={logo} alt={"logo"} width={300}/>
                    </Link>
                </div>
                <Group spacing={5} className={classes.links}>
                    {items}
                </Group>
                {MenuDropdown}

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
                        <>
                            <Paper
                                className={classes.dropdown}
                                withBorder
                                style={styles}
                            >
                                {items}
                                <Group spacing={5}>
                                    <Text color="white" size="sm">
                                        {`${safeContext.safeAuthSignInResponse?.eoa.slice(
                                                0,
                                                6
                                            )}...${safeContext.safeAuthSignInResponse?.eoa.slice(-4)}` ||
                                            "Not logged in"}
                                    </Text>
                                    <Logout/>
                                </Group>
                                {MenuDropdown}
                            </Paper>
                        </>
                    )}
                </Transition>
            </Container>
        </Header>
    );
}
