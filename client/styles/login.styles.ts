import {createStyles} from "@mantine/core";

export const loginStyles = createStyles((theme) => ({
    loginBtn: {
        backgroundColor: theme.colors.blueTheme[0],
        color: theme.colors.blueTheme[1],
        padding: "30px 60px",
        margin: "8px 0",
        width: "350px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
        fontSize: "1.2rem",
        fontWeight: "bold",
        "&:hover": {
            backgroundColor: theme.colors.blueTheme[3],
            color: theme.colors.blueTheme[1],
            transition: "all 0.3s ease-in-out"
        }
    },
    registrationForm: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.blueTheme[1],
    }
}))