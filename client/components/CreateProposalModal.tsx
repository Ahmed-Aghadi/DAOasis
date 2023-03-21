import {useForm} from "@mantine/form";
import {ethers} from "ethers";
import {
    ActionIcon,
    Button,
    Grid,
    NumberInput,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import {IconTrash} from "@tabler/icons-react";
import SafeAuthContext from "@/contexts/SafeAuthContext";
import {useContext} from "react";
import axios from "axios";
import {showNotification, updateNotification} from "@mantine/notifications";
import {createSafe} from "@/lib/polybase";
import PolybaseContext, {MultiSig} from "@/contexts/PolybaseContext";

export default function CreateProposalModal({address}:{address: string}) {
    const safeContext = useContext(SafeAuthContext);
    const userContext = useContext(PolybaseContext);
    const form = useForm({
        initialValues: {
            title: "",
            description: "",
        },
        validate: {
            title: (value) => value.trim().length > 0 ? "Title is required" : "",
            description: (value) => value.trim().length > 0 ? "Description is required" : "",
        },
        validateInputOnChange: true,
    });

    const handleFormSubmit = async (values: {
        title: string;
        description: string;
    }) => {
        showNotification({
            id: "create-safe",
            title: "Creating Safe...",
            message: "Please wait while we create your Safe",
            loading: true,
            autoClose: false,
        });
        try {


            updateNotification({
                id: "create-safe",
                title: "Safe created!",
                message: `Safe created at`,
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
                Create Proposal
            </Text>
            <TextInput
                placeholder={"Title of the Proposal"}
                label="Title"
                required
                {...form.getInputProps(`title`)}
            />
            <Textarea
                placeholder={"Description of the Proposal"}
                label="Description"
                required
                {...form.getInputProps(`description`)}
            />
            <Button fullWidth type="submit" color="red" mt="md">
                Create Safe
            </Button>
        </form>
    );
}
