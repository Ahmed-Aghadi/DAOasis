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
import {useContext, useState} from "react";
import axios from "axios";
import {showNotification, updateNotification} from "@mantine/notifications";
import {createMultiSigProposal, createSafe} from "@/lib/polybase";
import PolybaseContext, {MultiSig} from "@/contexts/PolybaseContext";
import {useRouter} from "next/router";

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

export default function CreateProposalModal({address, name}: { address: string, name: string }) {
    const userContext = useContext(PolybaseContext);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm({
        initialValues: {
            title: "",
            description: "",
        },
        validate: {
            title: (value) => value.trim().length > 0 ? undefined : "Title is required",
            description: (value) => value.trim().length > 0 ? undefined : "Description is required",
        },
        validateInputOnChange: true,
    });

    const handleFormSubmit = async (values: {
        title: string;
        description: string;
    }) => {
        setLoading(true)
        showNotification({
            id: "create-safe",
            title: "Creating Proposal...",
            message: "Please wait while we create your proposal",
            loading: true,
            autoClose: false,
        });
        try {
            const data = await createMultiSigProposal({
                title: values.title,
                description: values.description,
                creator: userContext.user?.id!,
                multiSigId: address,
            })
            const id = data.response.data.id
            updateNotification({
                id: "create-safe",
                title: "Proposal created!",
                message: "Your proposal has been created successfully",
                autoClose: true,
                color: "green",
            });
            setTimeout(() => {
                router.push(`/proposal?id=${id}&name=${name}`)
            },1500)
        } catch (e) {
            console.log(e);
            updateNotification({
                id: "create-safe",
                title: "Error creating proposal",
                message: `Error creating proposal: ${e}`,
                autoClose: true,
                color: "red",
            });
        }
        setLoading(false)
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
                styles={(theme) => style(theme)}
                {...form.getInputProps("title")}
            />
            <Textarea
                placeholder={"Description of the Proposal"}
                label="Description"
                required
                styles={(theme) => style(theme)}
                {...form.getInputProps("description")}
            />
            <Button type="submit" disabled={loading} fullWidth mt="md" styles={(theme) => ({
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
