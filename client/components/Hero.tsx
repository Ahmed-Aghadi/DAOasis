import {createStyles, Container, Text, Button, Group, rem} from '@mantine/core';
import {motion} from 'framer-motion';
import bgImage from "../public/logo-wo-bg.png"
import Image from "next/image";
import {notifications} from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
    hero: {
        backgroundColor: theme.colors.blueTheme[0],
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        position: 'relative',
    },
    btn: {
        position: 'absolute',
        bottom: rem(200),
        left: rem(370),
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

    const notif = () => {
        notifications.show({
            title: "Source Code",
            message: "This is the source code for the app",
            autoClose: true,
        })
    }

    return (
        <div className={classes.hero}>
            <div className={classes.image}>
                <Image src={bgImage} alt={"logo"} width={1100} height={750}/>
                <div className={classes.btn}>
                    <Button onClick={notif} mx={"md"} size={"xl"} className={classes.btns}>Source Code</Button>
                    <Button component={"a"} href={"/login"} mx={"md"} size={"xl"} className={classes.btns}>
                        <motion.div whileHover={{scale: 1.0}} whileTap={{scale: 0.9}}>
                            Launch App
                        </motion.div>
                    </Button>
                </div>
            </div>
        </div>
    );
}