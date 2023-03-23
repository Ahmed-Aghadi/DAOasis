import {Title, Text, TextInput, Textarea, Select, Button, Accordion, NumberInput} from "@mantine/core";
import {useContext, useState} from "react";
import {useForm} from "@mantine/form";
import {ethers} from "ethers";
import {parseAbiToFunction} from "@/lib/abiParse";
import StyledAccordion from "@/components/StyledAccordion";
import safeAuthContext from "@/contexts/SafeAuthContext";
import {proposeTransaction} from "@/lib/safeTransactions";
import {useRouter} from "next/router";
import {addTxnHash} from "@/lib/polybase";
import {showNotification} from "@mantine/notifications";

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
    const safeContext = useContext(safeAuthContext)
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    let abiFunctions: any[] = []
    const [selectData, setSelectData] = useState<any[]>([]);
    const [selectedFunctionComponent, setSelectedFunctionComponent] = useState<any>(null);

    const txnProposalForm = useForm({
        initialValues: {
            contractAddress: "",
            functionName: "",
            abi: "",
            value: "0",
            args: [],
        },
        validate: {
            contractAddress: (value) => ethers.utils.isAddress(value!) ? undefined : "Invalid address",
            abi: (value) => validateAbiInput(value) ? undefined : "Invalid ABI",
            functionName: (value) => handleSelectChange(value) ? undefined : "Select a function",
            value: (value) => /[0-9]*\.[0-9]+/i.test(value) ? "Invalid value" : undefined,
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
            value: (value) => /[0-9]*\.[0-9]+/i.test(value) ? undefined : "Invalid value",
        },
        validateInputOnChange: true,
    })

    const validateAbiInput = (abi: string) => {
        try {
            const parsedAbi = parseAbiToFunction(abi).filteredAbi;
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
                <TextInput key={index} my="sm" placeholder={input.type} required
                           label={`${input.name} (${input.type})`} {...txnProposalForm.getInputProps(`args.${index}`)}
                           styles={(theme) => style(theme)}/>
            )
        })
        setSelectedFunctionComponent(functionComponent)
        return true
    }

    const handleProposalSubmit = async (values: any) => {
        setLoading(true)
        const func = abiFunctions[values.functionName]
        console.log(func)
        let args_ = values.args
        for (let i = 0; i < values.args.length; i++) {
            if (func.inputs[i].type.includes("uint")) {
                args_[i] = parseInt(values.args[i])
            }
        }
        try{
            const parsedAbi = parseAbiToFunction(values.abi).functionAbi;
        const iFace = new ethers.utils.Interface([parsedAbi[values.functionName]])
        const data = iFace.encodeFunctionData(func.name, args_)
        console.log("data", data)
        const txHash = await proposeTransaction(safeContext.provider!, router.query.address as string, router.query.chainId as string, values.contractAddress, values.value, data)
        const response = await addTxnHash(router.query.id as string, txHash)
        console.log(response)
        setLoading(false)
        setTimeout(() => {
            router.back()
        }, 1500)

        } catch (e: any){
            console.log(e)
            showNotification({
                title: "Error",
                message: e.message,
                color: "red",
                autoClose: false,
            })
            setLoading(false)
        }
    }

    const handleTransferSubmit = async (values: any) => {
        setLoading(true)
        const txHash = await proposeTransaction(safeContext.provider!, router.query.address as string, router.query.chainId as string, values.contractAddress, values.value, "")
        const response = await addTxnHash(router.query.id as string, txHash)
        console.log(response)
        setLoading(false)
        setTimeout(() => {
            router.back()
        }, 1500)
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
                        <form onSubmit={txnProposalForm.onSubmit(async (values) => handleProposalSubmit(values))}>
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
                                <>
                                    <TextInput my="sm" placeholder="Enter the value" required
                                               label="Enter the amount you want to send (Leave 0 if no amount has to be sent)" {...txnProposalForm.getInputProps("value")}
                                               styles={(theme) => style(theme)}/>
                                    <Button loading={loading} fullWidth type="submit" color="red" mt="md"
                                            styles={(theme) => ({
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
                                </>}
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
                        <form onSubmit={transferProposalForm.onSubmit(async (values) => handleTransferSubmit(values))}>
                            <TextInput my="sm" placeholder="Enter the contract address" required
                                       label="Enter the contract address you want to send funds to" {...transferProposalForm.getInputProps("contractAddress")}
                                       styles={(theme) => style(theme)}/>
                            <TextInput my="sm" placeholder="Enter the amount" required
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