import {Tabs, TabsProps, rem} from "@mantine/core";

export function StyledTabs(props: TabsProps) {
    return (
        <Tabs
            unstyled
            styles={(theme) => ({
                tab: {
                    ...theme.fn.focusStyles(),
                    backgroundColor: theme.colors.blueTheme[3],
                    color: theme.colors.blueTheme[1],
                    border: 0,
                    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                    cursor: 'pointer',
                    fontSize: theme.fontSizes.sm,
                    display: 'flex',
                    alignItems: 'center',

                    '&:disabled': {
                        opacity: 0.5,
                        cursor: 'not-allowed',
                    },

                    '&:not(:first-of-type)': {
                        borderLeft: 0,
                    },

                    '&:first-of-type': {
                        borderTopLeftRadius: theme.radius.md,
                        borderBottomLeftRadius: theme.radius.md,
                    },

                    '&:last-of-type': {
                        borderTopRightRadius: theme.radius.md,
                        borderBottomRightRadius: theme.radius.md,
                    },

                    '&[data-active]': {
                        backgroundColor: theme.colors.blueTheme[0],
                        color: theme.white,
                    },
                },

                tabIcon: {
                    marginRight: theme.spacing.xs,
                    display: 'flex',
                    alignItems: 'center',
                },

                tabsList: {
                    display: 'flex',
                },
            })}
            {...props}
        />
    );
}