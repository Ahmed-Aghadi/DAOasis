import { useForm } from "@mantine/form";
import { ethers } from "ethers";
import {
    ActionIcon,
    Button,
    Grid,
    NumberInput,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import { useContext } from "react";
import axios from "axios";
import { showNotification, updateNotification } from "@mantine/notifications";
import { createSafe } from "@/lib/polybase";
import PolybaseContext, { MultiSig } from "@/contexts/PolybaseContext";

export default function CreateSafeForm() {
    const safeContext = useContext(SafeAuthContext);
    const userContext = useContext(PolybaseContext);
    const form = useForm({
        initialValues: {
            name: "",
            description: "",
            owners: [{ address: safeContext.safeAuthSignInResponse?.eoa }],
            threshold: 1,
        },
        validate: {
            owners: {
                address: (value) =>
                    ethers.utils.isAddress(value!)
                        ? undefined
                        : "Invalid address",
            },
        },
        validateInputOnChange: true,
    });

    const handleFormSubmit = async (values: {
        name: string;
        description: string;
        owners: { address: string | undefined }[];
        threshold: number;
    }) => {
        showNotification({
            id: "create-safe",
            title: "Creating Safe...",
            message: "Please wait while we create your Safe",
            loading: true,
            autoClose: false,
        });
        const owners = values.owners.map((owner) => owner.address);
        try {
            const response = await axios.post("/api/createSafe", {
                threshold: values.threshold,
                owners: owners,
                chainId: safeContext.safeAuthSignInResponse?.chainId,
            });
            const safeAddress = response.data.safeAddress;
            console.log(safeAddress);

            const safePolybaseResponse = await createSafe({
                id: safeAddress,
                name: values.name,
                description: values.description,
                owners: owners as `0x${string}`[],
                threshold: values.threshold,
                chainId: safeContext.safeAuthSignInResponse?.chainId!,
            });
            console.log("Safe created in Polybase", safePolybaseResponse);
            const currentMultiSig = safePolybaseResponse.response
                .data as MultiSig;
            userContext.setMultiSigs([
                ...userContext.multiSigs,
                currentMultiSig,
            ]);

            updateNotification({
                id: "create-safe",
                title: "Safe created!",
                message: `Safe created at ${safeAddress}`,
                autoClose: true,
                color: "green",
            });
        } catch (e) {
            console.log(e);
            updateNotification({
                id: "create-safe",
                title: "Error creating Safe",
                message: `Error creating Safe: ${e}`,
                autoClose: true,
                color: "red",
            });
        }
    };

    return (
        <form
            onSubmit={form.onSubmit(
                async (values) => await handleFormSubmit(values)
            )}
        >
            <Text size={"xl"} weight={"bold"}>
                Create Safe
            </Text>
            <TextInput
                placeholder={"Name of the Safe"}
                label="Name"
                required
                {...form.getInputProps(`name`)}
            />
            <Textarea
                placeholder={"Description of the Safe"}
                label="Description"
                required
                {...form.getInputProps(`description`)}
            />
            <NumberInput
                min={1}
                placeholder={
                    "Minimum number of owners required to confirm a transaction"
                }
                label="Threshold"
                required
                {...form.getInputProps(`threshold`)}
            />
            {form.values.owners.map((owner, index) => {
                return (
                    <Grid key={index} my={"xs"}>
                        <Grid.Col span={11}>
                            <TextInput
                                placeholder={"Owner address"}
                                label={`Owner ${index + 1}`}
                                {...form.getInputProps(
                                    `owners.${index}.address`
                                )}
                            />
                        </Grid.Col>
                        <Grid.Col
                            span={1}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <ActionIcon
                                color={"red"}
                                variant={"subtle"}
                                onClick={() => {
                                    form.removeListItem(`owners`, index);
                                }}
                            >
                                <IconTrash />
                            </ActionIcon>
                        </Grid.Col>
                    </Grid>
                );
            })}
            <Button
                onClick={() => {
                    form.insertListItem(`owners`, { address: "" });
                }}
            >
                Add owner
            </Button>
            <br />
            <Button fullWidth type="submit" color="red" mt="md">
                Create Safe
            </Button>
        </form>
    );
}
