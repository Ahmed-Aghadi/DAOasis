import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { MantineProvider, MantineThemeOverride } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import { SafeAuthContextProvider } from "@/contexts/SafeAuthContext";
import { PolybaseContextProvider } from "@/contexts/PolybaseContext";

const myTheme: MantineThemeOverride = {
    colorScheme: "light",
    colors: {
        blueTheme: ["#3304ba", "#fff", "#e1dbf5", "#c4b7eb", "#a793e1"],
    },
};

export default function App({ Component, pageProps }: AppProps) {
    return (
        <SafeAuthContextProvider>
            <PolybaseContextProvider>
                <MantineProvider theme={myTheme}>
                    <Notifications position="top-right" />
                    <motion.div
                        key={675}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Component {...pageProps} />
                    </motion.div>
                </MantineProvider>
            </PolybaseContextProvider>
        </SafeAuthContextProvider>
    );
}
