import { Select } from "@mantine/core";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import { useContext } from "react";

export default function ChainSelect(props: any) {
    const { setChainId, chainId } = useContext(SafeAuthContext);

    return (
        <div style={{ width: props.width }}>
            <Select
                size={"md"}
                label={props.label}
                mb={"sm"}
                placeholder="Defaults to Goerli"
                defaultValue={chainId}
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
