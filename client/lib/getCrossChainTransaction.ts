import { create, SdkConfig } from "@connext/sdk";
import { BigNumber, ethers } from "ethers";
import { getDomainId } from "./getDomainId";
import { getRpc } from "./getRpc";
import { getWethAddress } from "./getWethAddress";
import {
    SafeTransactionDataPartial,
    MetaTransactionData,
} from "@safe-global/safe-core-sdk-types";

export async function getCrossChainTransaction(
    signer: ethers.Signer,
    chainId: string, // current chain (source chain)
    chainId1: string, // destination chain
    amount: string, // amount to transfer (will be converted to weth on source chain)
    slippage: string, // example: 1000 = 10%
    safeAddress1: string, // safe address to send funds to on destination chain
    network: "mainnet" | "testnet",
    toAddress: string, // address to call on destination chain ( cross chain transaction )
    value: string, // value to send while doing cross chain transaction on toAddress ( don't parseEther as it will be done in the function )
    data: string, // data to send while doing cross chain transaction on toAddress
    operation: "CALL" | "DELEGATECALL", // operation to do while doing cross chain transaction on toAddress
    approveInfiniteAmount: boolean = true // approve infinite amount of weth on source chain
) {
    const signerAddress = await signer.getAddress();

    const sdkConfig: SdkConfig = {
        signerAddress: signerAddress,
        // Use `mainnet` when you're ready...
        network: network,
        // Add more chains here! Use mainnet domains if `network: mainnet`
        // This information can be found at https://docs.connext.network/resources/supported-chains
        chains: {
            [getDomainId(chainId)]: {
                providers: [getRpc(chainId)],
            },
            [getDomainId(chainId1)]: {
                providers: [getRpc(chainId1)],
            },
        },
    };

    const { sdkBase } = await create(sdkConfig);

    // Default to Goerli -> Optimism-Goerli with 1 TEST if variables
    // are not defined in .env.
    const originDomain = getDomainId(chainId).toString();
    const destinationDomain = getDomainId(chainId1).toString();
    const originAsset = getWethAddress(chainId);

    // Estimate the relayer fee
    const relayerFee = (
        await sdkBase.estimateRelayerFee({
            originDomain,
            destinationDomain,
        })
    ).toString();

    // (address _to, uint256 _value, bytes memory _data, Enum.Operation _operation) = abi.decode(
    //     _callData,
    //     (address, uint256, bytes, Enum.Operation)
    // );

    const callData = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes", "uint8"],
        [
            toAddress,
            ethers.utils.parseEther(value).toString(),
            data,
            operation === "CALL" ? 0 : 1,
        ]
    );

    // Prepare the xcall params
    const xcallParams = {
        origin: originDomain, // send from Source Domain
        destination: destinationDomain, // to Destination Domain
        to: safeAddress1, // the address that should receive the funds on destination
        asset: originAsset, // address of the token contract
        delegate: "''''", // address allowed to execute transaction on destination side in addition to relayers
        amount: amount, // amount of tokens to transfer
        slippage: slippage, // the maximum amount of slippage the user will accept in BPS (e.g. 30 = 0.3%)
        callData: callData, // empty calldata for a simple transfer (byte-encoded)
        relayerFee: relayerFee, // fee paid to relayers
    };

    // Approve the asset transfer if the current allowance is lower than the amount.
    // Necessary because funds will first be sent to the Connext contract in xcall.
    const approveTxReq = await sdkBase.approveIfNeeded(
        originDomain,
        originAsset,
        amount,
        approveInfiniteAmount
    );

    // maybe here's a mistake
    const approveTxReqTransactionData = {
        to: approveTxReq!.to!,
        value: approveTxReq!.value ? approveTxReq!.value.toString() : "0",
        data: approveTxReq!.data ? approveTxReq!.data.toString() : "0x",
    };

    // let safeTransactionData: SafeTransactionDataPartial = {
    //     to: to,
    //     value: ethers.utils.parseEther(value).toString(),
    //     data: data,
    //     operation: OperationType.Call,
    // };

    // let safeTransactionData: MetaTransactionData[] = [
    //     deployModuleTransaction,
    //     enableModuleTransactionData,
    // ];

    // if (approveTxReq) {
    //     const approveTxReceipt = await signer.sendTransaction(approveTxReq);
    //     await approveTxReceipt.wait();
    // }

    let safeTransactionData: SafeTransactionDataPartial | MetaTransactionData[];

    // Send the xcall
    const xcallTxReq = await sdkBase.xcall(xcallParams);
    const xcallTxTransactionData = {
        to: xcallTxReq.to!,
        value: xcallTxReq.value ? xcallTxReq.value.toString() : "0",
        data: xcallTxReq.data ? xcallTxReq.data.toString() : "0x",
    };
    xcallTxReq.gasLimit = BigNumber.from("20000");
    if (approveTxReq) {
        safeTransactionData = [
            approveTxReqTransactionData,
            xcallTxTransactionData,
        ];
    } else {
        safeTransactionData = xcallTxTransactionData;
    }
    return safeTransactionData;
    // const xcallTxReceipt = await signer.sendTransaction(xcallTxReq);
    // console.log(xcallTxReceipt);
    // await xcallTxReceipt.wait();
}
