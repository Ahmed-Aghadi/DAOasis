import { deployAndSetUpCustomModule } from "@gnosis.pm/zodiac";
import MODULE_CONTRACT_ARTIFACT from "@/constants/DAOasisModule.json";
import myModuleMastercopyDeployment from "@/constants/myModuleMastercopyDeployment.abi.json";
import SafeAbi from "@/constants/Safe.abi.json";
import { ethers } from "ethers";
import { getDomainId } from "./getDomainId";
import {
    SafeTransactionDataPartial,
    MetaTransactionData,
} from "@safe-global/safe-core-sdk-types";
import { getConnextAddress } from "./getConnextAddress";

export function enableSafeModule(
    safeContractAddress: string,
    safeContractAddress1: string, // contract address at other chain
    provider: ethers.providers.Provider,
    chainId: string // chainId of the other chain
) {
    const { transaction, expectedModuleAddress } = deployAndSetUpCustomModule(
        "0x364c47603Ed669168FE1Cf53a688E6aeB629aF51",
        myModuleMastercopyDeployment,
        {
            types: [
                "address",
                "address",
                "address",
                "address",
                "uint32",
                "address",
            ],
            values: [
                safeContractAddress,
                safeContractAddress,
                safeContractAddress,
                safeContractAddress1,
                getDomainId(chainId),
                getConnextAddress(chainId),
            ],
        },
        provider,
        1,
        Date.now().toString()
    );

    console.log("expectedModuleAddress", expectedModuleAddress);
    const deployModuleTransaction: SafeTransactionDataPartial = {
        to: transaction.to,
        value: transaction.value.toString(),
        data: transaction.data,
    };
    // const safeContractInstance = new ethers.Contract(
    //     safeContractAddress,
    //     MODULE_CONTRACT_ARTIFACT.abi,
    //     provider
    // );
    // const tx = await safeContractInstanse.enableModule(myModuleProxyAddress)
    // tx.wait()
    // console.log("MyModule proxy enabled on the TestAvatar")
    let iface = new ethers.utils.Interface(SafeAbi);
    let data = iface.encodeFunctionData("enableModule", [
        expectedModuleAddress,
    ]);
    // Create transaction
    const enableModuleTransactionData: SafeTransactionDataPartial = {
        to: safeContractAddress,
        value: "0",
        data: data,
    };
    const safeTransactionData: MetaTransactionData[] = [
        deployModuleTransaction,
        enableModuleTransactionData,
    ];
    return safeTransactionData;
}
