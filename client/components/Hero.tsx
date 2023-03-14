import {createStyles, Container, Text, Button, Group, rem} from '@mantine/core';
import {GithubIcon} from '@mantine/ds';
import bgImage from "../public/logo-wo-bg.png"
import Image from "next/image";

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

    return (
        <div className={classes.hero}>
            <div className={classes.image}>
                <Image src={bgImage} alt={"logo"} width={1100} height={750}/>
                <div className={classes.btn}>
                    <Button mx={"md"} size={"xl"} className={classes.btns}>Source Code</Button>
                    <Button mx={"md"} size={"xl"} className={classes.btns}>Launch App</Button>
                </div>
            </div>
        </div>
    );
}