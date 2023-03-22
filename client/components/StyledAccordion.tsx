import {Accordion, AccordionProps, createStyles, rem} from '@mantine/core';

const useStyles = createStyles((theme) => ({
    root: {
        borderRadius: theme.radius.sm,
        width: "100%",
    },

    item: {
        backgroundColor: theme.colors.blueTheme[2],
        border: `${rem(1)} solid transparent`,
        borderRadius: theme.radius.md,
        position: 'relative',
        zIndex: 0,
        transition: 'transform 150ms ease',
        width: "100%",
        marginBottom: theme.spacing.md,

        '&[data-active]': {
            transform: 'scale(1.03)',
            backgroundColor: theme.colors.blueTheme[2],
            border: "none",
            borderRadius: theme.radius.md,
            zIndex: 1,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.md,
        },
    },

    chevron: {
        '&[data-rotate]': {
            transform: 'rotate(-90deg)',
        },
    },
}));

export default function StyledAccordion(props: AccordionProps) {
    const { classes } = useStyles();
    return (
        <Accordion
            mx="auto"
            variant="filled"
            defaultValue="customization"
            classNames={classes}
            className={classes.root}
            {...props}
        />
    );
}