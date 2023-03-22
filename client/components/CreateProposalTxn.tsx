import {Title, Text, TextInput, Textarea, Select, Button, Accordion, NumberInput} from "@mantine/core";
import {useState} from "react";
import {useForm} from "@mantine/form";
import {ethers} from "ethers";
import {parseAbiToFunction} from "@/lib/abiParse";
import StyledAccordion from "@/components/StyledAccordion";

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

export default function CreateProposalTxn() {
    let abiFunctions: any[] = []
    const [selectData, setSelectData] = useState<any[]>([]);
    const [selectedFunctionComponent, setSelectedFunctionComponent] = useState<any>(null);

    const txnProposalForm = useForm({
        initialValues: {
            contractAddress: "",
            functionName: "",
            abi: "",
            args: [],
        },
        validate: {
            contractAddress: (value) => ethers.utils.isAddress(value!) ? undefined : "Invalid address",
            abi: (value) => validateAbiInput(value) ? undefined : "Invalid ABI",
            functionName: (value) => handleSelectChange(value) ? undefined : "Select a function",
        },
        validateInputOnChange: true,
    })

    const transferProposalForm = useForm({
        initialValues: {
            contractAddress: "",
            value: "",
        },
        validate: {
            contractAddress: (value) => ethers.utils.isAddress(value!) ? undefined : "Invalid address",
        },
        validateInputOnChange: true,
    })

    const validateAbiInput = (abi: string) => {
        try {
            const parsedAbi = parseAbiToFunction(abi);
            // console.log(parsedAbi);
            abiFunctions = parsedAbi;
            const selectData_ = parsedAbi.map((abiFunction: any, index: number) => {
                return {
                    label: `${abiFunction.name}(${abiFunction.inputs.map((input: any) => input.type).join(", ")})`,
                    value: index,
                }
            })
            // console.log(selectData_)
            setSelectData(selectData_);
            return true
        } catch (e) {
            setSelectData([])
            setSelectedFunctionComponent(null)
            return false
        }
    }

    const handleSelectChange = (value: any) => {
        if (value === undefined) return false;
        const func = abiFunctions[value];
        const functionComponent = func?.inputs?.map((input: any, index: number) => {
            return (
                <TextInput my="sm" placeholder={input.type} required
                           label={`${input.name} (${input.type})`} {...txnProposalForm.getInputProps(`args.${index}`)}
                           styles={(theme) => style(theme)}/>
            )
        })
        setSelectedFunctionComponent(functionComponent)
        return true
    }

    return (
        <>
            <StyledAccordion defaultValue={"txn"}>
                <Accordion.Item value={"txn"}>
                    <Accordion.Control>
                        <Title color="#AE3EC9">Proposal Txn</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Text color="#CC5DE8">
                            Enter the contract address and the abi.
                        </Text>
                        <form onSubmit={txnProposalForm.onSubmit(async (values) => console.log(values))}>
                            <TextInput my="sm" placeholder="Enter the contract address" required
                                       label="Enter the contract address you want to interact with" {...txnProposalForm.getInputProps("contractAddress")}
                                       styles={(theme) => style(theme)}/>
                            <Textarea minRows={4} maxRows={9} my="sm"
                                      placeholder='[{"inputs":[], "name": "myFunction", "type":"function"}]' required
                                      label='Enter your ABI json  [{"inputs":[], "name": "myFunction", "type":"function"}]' {...txnProposalForm.getInputProps("abi")}
                                      styles={(theme) => style(theme)}
                            />
                            <Select data={selectData} placeholder="Select a function" required searchable
                                    label="Select a function" {...txnProposalForm.getInputProps("functionName")}
                                    styles={(theme) => ({
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
                                        },
                                        dropdown: {
                                            backgroundColor: theme.colors.blueTheme[3],
                                            border: "none"
                                        },
                                        item: {
                                            color: theme.colors.blueTheme[5],
                                            backgroundColor: theme.colors.blueTheme[3],
                                            '&[data-selected]': {
                                                '&, &:hover': {
                                                    backgroundColor: theme.colors.blueTheme[0],
                                                },
                                            },

                                            '&[data-hovered]': {
                                                backgroundColor: theme.colors.blueTheme[2]
                                            },
                                        },
                                    })}/>
                            {selectedFunctionComponent}
                            {selectedFunctionComponent &&
                                <Button fullWidth type="submit" color="red" mt="md" styles={(theme) => ({
                                    root: {
                                        backgroundColor: theme.colors.violet[6],
                                        "&:hover": {
                                            backgroundColor: `${theme.colors.violet[4]} !important`,
                                            color: `${theme.colors.blueTheme[1]} !important`,
                                        },
                                    }
                                })}>
                                    Create Proposal
                                </Button>}
                        </form>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value={"transfer"}>
                    <Accordion.Control>
                        <Title color="#AE3EC9">
                            Transfer Funds
                        </Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <form onSubmit={transferProposalForm.onSubmit(async (values) => console.log(values))}>
                            <TextInput my="sm" placeholder="Enter the contract address" required
                                       label="Enter the contract address you want to send funds to" {...transferProposalForm.getInputProps("contractAddress")}
                                       styles={(theme) => style(theme)}/>
                            <NumberInput my="sm" placeholder="Enter the amount" required precision={2} min={0.01}
                                         step={0.01}
                                         label="Enter the amount you want to send" {...transferProposalForm.getInputProps("value")
                                         } styles={(theme) => style(theme)}/>
                            <Button fullWidth type="submit" color="red" mt="md" styles={(theme) => ({
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
                    </Accordion.Panel>
                </Accordion.Item>
            </StyledAccordion>
        </>
    )
}