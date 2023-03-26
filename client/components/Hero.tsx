import {
    createStyles,
    Container,
    Text,
    Button,
    Group,
    rem,
    Center,
    Blockquote,
    Flex,
    SimpleGrid,
    Image as MantineImage
} from '@mantine/core';
import {motion} from 'framer-motion';
import bgImage from "../public/logo-wo-bg.png"
import img from "../public/img.png"
import Image from "next/image";
import {IconBrandGithub, IconSettingsFilled} from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
    hero: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        height: '100%',
        width: '100%',
        display: 'flex',
        // flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.blueTheme[0],
    },
    btn: {
        position: 'absolute',
        bottom: rem(200),
        left: rem(750),
    },
    btns: {
        backgroundColor: theme.colors.blueTheme[3],
        '&:hover': {
            backgroundColor: `${theme.colors.blueTheme[4]} !important`,
        }
    },
}));

export function HeroTitle() {
    const {classes} = useStyles();

    return (
        <div className={classes.hero}>
            <section className={classes.image}>
                <Flex direction="column">
                    <div style={{height: 600}}>
                        <Image src={bgImage} alt={"logo"} width={1000} height={750}/>
                    </div>
                    <Group position="center" mb="xl" pb={60}>
                        <Center>
                            <Button component="a" href="https://github.com/Suhel-Kap/DAOasis"
                                    leftIcon={<IconBrandGithub/>} target="_blank"
                                    mx={"md"} size={"xl"} className={classes.btns}>Source Code</Button>
                            <Button component={"a"} href={"/login"} mx={"md"} size={"xl"} className={classes.btns}>
                                <motion.div whileHover={{scale: 1.0}} whileTap={{scale: 0.9}}>
                                    Launch App
                                </motion.div>
                            </Button>
                        </Center>
                    </Group>
                </Flex>
            </section>
            <section style={{height: 350, display: "flex", alignItems: "center", justifyContent: "center"}}>
                <Center m={"xl"} p={"xl"}>
                    <Blockquote styles={(theme) => ({
                        body: {
                            fontSize: rem(30),
                            fontFamily: "Arial",
                            color: theme.colors.blueTheme[4]
                        }
                    })}>
                        DAOs simplifiied, even for web2 users.
                    </Blockquote>
                </Center>
            </section>
            <section style={{
                height: 650,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#3304ba",
                padding: "80px"
            }}>
                <Flex direction="column" w={"100%"}>
                    <Center my="xl">
                        <Text size={35} color={"white"}>
                            Technologies Used
                        </Text>
                    </Center>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                        <SimpleGrid cols={3} w={"95%"}>
                            <Center m="xs" p="xs">
                                <MantineImage src={"/gnosis.svg"} alt={"Gnosis Safe"} width={230} height={230}/>
                            </Center>
                            <Center m="xs" p="xs">
                                <MantineImage src={"/polygon.svg"} alt={"Polygon"} width={200} height={200}/>
                            </Center>
                            <Center m="xs" p="xs">
                                <MantineImage src={"/optimism.svg"} alt={"Optimism"} width={200} height={200}/>
                            </Center>
                        </SimpleGrid>
                        <SimpleGrid cols={2} w={"60%"} mt="xl">
                            <Center m="xs" p="xs">
                                <MantineImage src={"/connext.svg"} alt={"Connext"} width={200} height={200}/>
                            </Center>
                            <Center m="xs" p="xs">
                                <MantineImage src={"/polybase.webp"} alt={"Polybase"} width={200} height={200}/>
                            </Center>
                        </SimpleGrid>
                    </div>
                </Flex>
            </section>
        </div>
    );
}