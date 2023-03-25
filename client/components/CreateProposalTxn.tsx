import {
    Title,
    Text,
    TextInput,
    Textarea,
    Select,
    Button,
    Accordion,
    Checkbox,
} from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { ethers } from "ethers";
import { parseAbiToFunction } from "@/lib/abiParse";
import StyledAccordion from "@/components/StyledAccordion";
import safeAuthContext from "@/contexts/SafeAuthContext";
import {
    proposeModuleTransaction,
    proposeTransaction,
} from "@/lib/safeTransactions";
import { useRouter } from "next/router";
import { addTxnHash, getSafe } from "@/lib/polybase";
import { showNotification } from "@mantine/notifications";
import { IconChevronDown } from "@tabler/icons-react";
import { selectStyle } from "@/pages/create-app";
import { getCrossChainTransaction } from "@/lib/getCrossChainTransaction";

export const style = (theme: any) => ({
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
        },
    },
    label: {
        color: theme.colors.blueTheme[4],
    },
});

let abiFunctions: any[] = [];

export default function CreateProposalTxn() {
    const safeContext = useContext(safeAuthContext);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [moduleAddress, setModuleAddress] = useState<string>("");
    const [selectData, setSelectData] = useState<any[]>([]);
    const [selectedFunctionComponent, setSelectedFunctionComponent] =
        useState<any>(null);

    const txnProposalForm = useForm({
        initialValues: {
            contractAddress: "",
            functionName: "",
            abi: "",
            value: "0",
            args: [],
            enable: false,
            chainId: "",
            safeAddress: "",
            amountWeth: "0",
        },
        validate: {
            contractAddress: (value) =>
                ethers.utils.isAddress(value!) ? undefined : "Invalid address",
            abi: (value) =>
                validateAbiInput(value) ? undefined : "Invalid ABI",
            functionName: (value) =>
                handleSelectChange(value) ? undefined : "Select a function",
            value: (value) =>
                /[0-9]*\.[0-9]+/i.test(value) ? "Invalid value" : undefined,
            safeAddress: (value, values) =>
                values.enable
                    ? ethers.utils.isAddress(value!) &&
                      handleSafeAddressChange(value)
                        ? undefined
                        : "Invalid address"
                    : undefined,
            chainId: (value, values) =>
                values.enable
                    ? value
                        ? undefined
                        : "Invalid chain"
                    : undefined,
            amountWeth: (value) =>
                /[0-9]*\.[0-9]+/i.test(value) ? "Invalid value" : undefined,
        },
        validateInputOnChange: true,
    });

    const handleSafeAddressChange = (value: string) => {
        const isAddress = ethers.utils.isAddress(value);
        if (!isAddress) return true;
        getSafe(value as `0x${string}`).then((res) => {
            console.log("res", res);
            const moduleAddress = res.response.data.moduleAddress;
            setModuleAddress(moduleAddress);
            if (!moduleAddress) {
                showNotification({
                    title: "Safe address for other chain doesn't have module enabled",
                    message:
                        "Please enable module for the safe address of other chain",
                    color: "red",
                    autoClose: false,
                });
            }
        });
        return true;
    };

    const transferProposalForm = useForm({
        initialValues: {
            contractAddress: "",
            value: "",
        },
        validate: {
            contractAddress: (value) =>
                ethers.utils.isAddress(value!) ? undefined : "Invalid address",
            value: (value) =>
                /[0-9]*\.[0-9]+/i.test(value) ? undefined : "Invalid value",
        },
        validateInputOnChange: true,
    });

    const validateAbiInput = (abi: string) => {
        try {
            const parsedAbi = parseAbiToFunction(abi).filteredAbi;
            // console.log(parsedAbi);
            abiFunctions = parsedAbi;
            const selectData_ = parsedAbi.map(
                (abiFunction: any, index: number) => {
                    return {
                        label: `${abiFunction.name}(${abiFunction.inputs
                            .map((input: any) => input.type)
                            .join(", ")})  - ${abiFunction.stateMutability}`,
                        value: index,
                    };
                }
            );
            // console.log(selectData_)
            setSelectData(selectData_);
            return true;
        } catch (e) {
            setSelectData([]);
            setSelectedFunctionComponent(null);
            return false;
        }
    };

    const handleSelectChange = (value: any) => {
        if (value === undefined) return false;
        const func = abiFunctions[value];
        const functionComponent = func?.inputs?.map(
            (input: any, index: number) => {
                return (
                    <TextInput
                        key={index}
                        my="sm"
                        placeholder={input.type}
                        required
                        label={`${input.name} (${input.type})`}
                        {...txnProposalForm.getInputProps(`args.${index}`)}
                        styles={(theme) => style(theme)}
                    />
                );
            }
        );
        setSelectedFunctionComponent(functionComponent);
        return true;
    };

    const handleProposalSubmit = async (values: any) => {
        setLoading(true);
        const func = abiFunctions[values.functionName];
        console.log(func);
        let args_ = values.args;
        for (let i = 0; i < values.args.length; i++) {
            if (func.inputs[i].type.includes("uint")) {
                args_[i] = parseInt(values.args[i]);
            }
        }
        try {
            const parsedAbi = parseAbiToFunction(values.abi).functionAbi;
            const iFace = new ethers.utils.Interface([
                parsedAbi[values.functionName],
            ]);
            const data = iFace.encodeFunctionData(func.name, args_);
            console.log("data", data);

            if (values.enable) {
                if (!moduleAddress) {
                    showNotification({
                        title: "Safe address for other chain doesn't have module enabled",
                        message:
                            "Please enable module for the safe address of other chain",
                        color: "red",
                        autoClose: false,
                    });
                    setLoading(false);
                    return;
                }
                const amount = ethers.utils
                    .parseEther(values.amountWeth)
                    .toString();
                const safeTransactionData = await getCrossChainTransaction(
                    router.query.address as string,
                    router.query.chainId as string,
                    values.chainId,
                    amount,
                    "1000",
                    moduleAddress,
                    values.chainId === "0x5" ? "testnet" : "mainnet",
                    values.contractAddress,
                    values.value,
                    data,
                    "CALL"
                );
                const txHash = await proposeModuleTransaction(
                    safeContext.provider!,
                    router.query.address as string,
                    router.query.chainId as string,
                    safeTransactionData
                );
                await addTxnHash(router.query.id as string, txHash);
            } else {
                const txHash = await proposeTransaction(
                    safeContext.provider!,
                    router.query.address as string,
                    router.query.chainId as string,
                    values.contractAddress,
                    values.value,
                    data
                );
                const response = await addTxnHash(
                    router.query.id as string,
                    txHash
                );
            }
            setLoading(false);
            setTimeout(() => {
                router.reload();
            }, 1500);
        } catch (e: any) {
            console.log(e);
            showNotification({
                title: "Error",
                message: e.message,
                color: "red",
                autoClose: false,
            });
            setLoading(false);
        }
    };

    const handleTransferSubmit = async (values: any) => {
        setLoading(true);
        const txHash = await proposeTransaction(
            safeContext.provider!,
            router.query.address as string,
            router.query.chainId as string,
            values.contractAddress,
            values.value,
            ""
        );
        const response = await addTxnHash(router.query.id as string, txHash);
        console.log(response);
        setLoading(false);
        setTimeout(() => {
            router.back();
        }, 1500);
    };

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
                        <form
                            onSubmit={txnProposalForm.onSubmit(async (values) =>
                                handleProposalSubmit(values)
                            )}
                        >
                            <Checkbox
                                mt="md"
                                {...txnProposalForm.getInputProps("enable")}
                                label="Cross Chain Transaction"
                                styles={(theme) => ({
                                    label: {
                                        color: theme.colors.blueTheme[4],
                                    },
                                    input: {
                                        backgroundColor:
                                            theme.colors.blueTheme[3],
                                        "&:checked": {
                                            backgroundColor:
                                                theme.colors.blueTheme[0],
                                            borderColor:
                                                theme.colors.blueTheme[0],
                                        },
                                    },
                                })}
                            />
                            {txnProposalForm.values.enable && (
                                <>
                                    <TextInput
                                        placeholder={
                                            "Address of Safe on other chain"
                                        }
                                        label={`Address`}
                                        required
                                        {...txnProposalForm.getInputProps(
                                            `safeAddress`
                                        )}
                                        styles={(theme) => style(theme)}
                                    />
                                    <Select
                                        data={[
                                            {
                                                label: "Gnosis",
                                                value: "0x64",
                                            },
                                            {
                                                label: "Goerli",
                                                value: "0x5",
                                            },
                                            {
                                                label: "Polygon",
                                                value: "0x89",
                                            },
                                            {
                                                label: "Optimism",
                                                value: "0xa",
                                            },
                                        ]}
                                        rightSection={
                                            <IconChevronDown
                                                color="#fff"
                                                size="1rem"
                                            />
                                        }
                                        my="sm"
                                        placeholder="Enter the chain ID"
                                        required
                                        label="Contract Chain ID"
                                        {...txnProposalForm.getInputProps(
                                            "chainId"
                                        )}
                                        styles={(theme) => selectStyle(theme)}
                                    />
                                    <TextInput
                                        my="sm"
                                        placeholder="Enter the amount of wETH to send to safe"
                                        required
                                        label="Enter the amount you want to send (Leave 0 if no amount has to be sent)"
                                        {...txnProposalForm.getInputProps(
                                            "amountWeth"
                                        )}
                                        styles={(theme) => style(theme)}
                                    />
                                </>
                            )}
                            <TextInput
                                my="sm"
                                placeholder="Enter the contract address"
                                required
                                label="Enter the contract address you want to interact with"
                                {...txnProposalForm.getInputProps(
                                    "contractAddress"
                                )}
                                styles={(theme) => style(theme)}
                            />
                            <Textarea
                                minRows={4}
                                maxRows={9}
                                my="sm"
                                placeholder='[{"inputs":[], "name": "myFunction", "type":"function"}]'
                                required
                                label='Enter your ABI json  [{"inputs":[], "name": "myFunction", "type":"function"}]'
                                {...txnProposalForm.getInputProps("abi")}
                                styles={(theme) => style(theme)}
                            />
                            <Select
                                data={selectData}
                                placeholder="Select a function"
                                required
                                searchable
                                label="Select a function"
                                {...txnProposalForm.getInputProps(
                                    "functionName"
                                )}
                                styles={(theme) => ({
                                    input: {
                                        backgroundColor:
                                            theme.colors.blueTheme[3],
                                        borderRadius: "0.5rem",
                                        color: theme.colors.blueTheme[5],
                                        borderColor: theme.colors.blueTheme[3],
                                        "&:focus": {
                                            borderColor: "#3304ba",
                                        },
                                        "&::placeholder": {
                                            color: theme.colors.blueTheme[5],
                                        },
                                    },
                                    label: {
                                        color: theme.colors.blueTheme[4],
                                    },
                                    dropdown: {
                                        backgroundColor:
                                            theme.colors.blueTheme[3],
                                        border: "none",
                                    },
                                    item: {
                                        color: theme.colors.blueTheme[5],
                                        backgroundColor:
                                            theme.colors.blueTheme[3],
                                        "&[data-selected]": {
                                            "&, &:hover": {
                                                backgroundColor:
                                                    theme.colors.blueTheme[0],
                                            },
                                        },

                                        "&[data-hovered]": {
                                            backgroundColor:
                                                theme.colors.blueTheme[2],
                                        },
                                    },
                                })}
                            />
                            {selectedFunctionComponent}
                            {selectedFunctionComponent && (
                                <>
                                    <TextInput
                                        my="sm"
                                        placeholder="Enter the value"
                                        required
                                        label="Enter the amount you want to send (Leave 0 if no amount has to be sent)"
                                        {...txnProposalForm.getInputProps(
                                            "value"
                                        )}
                                        styles={(theme) => style(theme)}
                                    />
                                </>
                            )}
                            <Button
                                loading={loading}
                                fullWidth
                                type="submit"
                                color="red"
                                mt="md"
                                styles={(theme) => ({
                                    root: {
                                        backgroundColor: theme.colors.violet[6],
                                        "&:hover": {
                                            backgroundColor: `${theme.colors.violet[4]} !important`,
                                            color: `${theme.colors.blueTheme[1]} !important`,
                                        },
                                    },
                                })}
                            >
                                Create Proposal
                            </Button>
                        </form>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value={"transfer"}>
                    <Accordion.Control>
                        <Title color="#AE3EC9">Transfer Funds</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <form
                            onSubmit={transferProposalForm.onSubmit(
                                async (values) => handleTransferSubmit(values)
                            )}
                        >
                            <TextInput
                                my="sm"
                                placeholder="Enter the contract address"
                                required
                                label="Enter the contract address you want to send funds to"
                                {...transferProposalForm.getInputProps(
                                    "contractAddress"
                                )}
                                styles={(theme) => style(theme)}
                            />
                            <TextInput
                                my="sm"
                                placeholder="Enter the amount"
                                required
                                label="Enter the amount you want to send"
                                {...transferProposalForm.getInputProps("value")}
                                styles={(theme) => style(theme)}
                            />
                            <Button
                                fullWidth
                                type="submit"
                                color="red"
                                mt="md"
                                styles={(theme) => ({
                                    root: {
                                        backgroundColor: theme.colors.violet[6],
                                        "&:hover": {
                                            backgroundColor: `${theme.colors.violet[4]} !important`,
                                            color: `${theme.colors.blueTheme[1]} !important`,
                                        },
                                    },
                                })}
                            >
                                Create Proposal
                            </Button>
                        </form>
                    </Accordion.Panel>
                </Accordion.Item>
            </StyledAccordion>
        </>
    );
}
