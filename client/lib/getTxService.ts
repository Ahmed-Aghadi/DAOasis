export const getTxService = (chainId: string) => {
    switch (chainId) {
        case "0x64":
            return "https://safe-transaction-gnosis-chain.safe.global/";
        case "0x89":
            return "https://safe-transaction-polygon.safe.global/";
        case "0x5":
            return "https://safe-transaction-goerli.safe.global/";
        case "0xa":
            return "https://safe-transaction-optimism.safe.global/";
        default:
            return "https://safe-transaction-goerli.safe.global/";
    }
};
