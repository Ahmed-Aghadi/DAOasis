import { Select } from "@mantine/core";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import { useContext } from "react";

export default function ChainSelect() {
    const { setChainId } = useContext(SafeAuthContext);

    return (
        <div style={{ width: "350px" }}>
            <Select
                size={"md"}
                label="Select chain"
                mb={"sm"}
                placeholder="Defaults to Goerli"
                data={[
                    { label: "Gnosis", value: "0x64" },
                    { label: "Goerli", value: "0x5" },
                    { label: "Polygon", value: "0x89" },
                    { label: "Optimism", value: "0xa" },
                ]}
                onChange={(value) => {
                    console.log(value);
                    setChainId(value as string);
                }}
                styles={(theme) => ({
                    item: {
                        "&[data-selected]": {
                            "&, &:hover": {
                                backgroundColor: theme.colors.blueTheme[0],
                                color: theme.colors.blueTheme[1],
                            },
                        },
                        "&[data-hovered]": {},
                    },
                })}
            />
        </div>
    );
}
