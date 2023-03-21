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

const style = (theme: any) => ({
    input: {
        backgroundColor: theme.colors.blueTheme[3],
        borderRadius: "0.5rem",
        color: theme.colors.blueTheme[5],
        borderColor: theme.colors.blueTheme[3],
        "&:focus": {
            borderColor: "#3304ba",
        },
        "&::placeholder": {
            color: theme.colors.blueTheme[5],
        }
    },
    label: {
        color: theme.colors.blueTheme[4],
    }
})

export default function CreateProposalModal({address}:{address: string}) {
    const safeContext = useContext(SafeAuthContext);
    const userContext = useContext(PolybaseContext);
    const form = useForm({
        initialValues: {
            title: "",
            description: "",
        },
        validate: {
            title: (value) => value.trim().length > 0 ? "" : "Title is required",
            description: (value) => value.trim().length > 0 ? "" : "Description is required",
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
            <TextInput
                placeholder={"Title of the Proposal"}
                label="Title"
                required
                {...form.getInputProps(`title`)}
                styles={(theme) => style(theme)}
            />
            <Textarea
                placeholder={"Description of the Proposal"}
                label="Description"
                required
                {...form.getInputProps(`description`)}
                styles={(theme) => style(theme)}
            />
            <Button fullWidth type="submit" mt="md" styles={(theme) => ({
                root: {
                    backgroundColor: theme.colors.violet[6],
                    "&:hover": {
                        backgroundColor: `${theme.colors.violet[4]} !important`,
                        color: `${theme.colors.blueTheme[1]} !important`,
                    },
                }
            })}>
                Create Proposal
            </Button>
        </form>
    );
}
