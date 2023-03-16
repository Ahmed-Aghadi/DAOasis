import {useForm} from "@mantine/form";
import {ethers} from "ethers";
import {Button, Paper, TextInput} from "@mantine/core";

export default function CreateSafeForm() {
    const form = useForm({
        initialValues: {
            owners: [{address: ""}],
            threshold: 1,
        },
        validate: {
            owners: {
                address: (value) => ethers.utils.isAddress(value) ? undefined : "Invalid address"
            }
        },
        validateInputOnChange: true,
    })

    return (
        <form onSubmit={(values) => console.log(values)}>
            {
                form.values.owners.map((owner, index) => {
                        return (
                            <Paper key={index}>
                                <TextInput
                                    label={`Owner ${index + 1}`}
                                    {...form.getInputProps(`owners.${index}.address`)}
                                />
                            </Paper>
                        )
                    }
                )
            }
            <Button onClick={() => {
                form.insertListItem(`owners`, {address: ""})
            }}>Add owner</Button>
        </form>
    )
}