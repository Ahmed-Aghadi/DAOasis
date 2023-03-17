export const getRpc = (chainId: string) => {
    switch (chainId) {
        case "0x64":
            return "https://rpc.ankr.com/gnosis";
        case "0x89":
            return "https://polygon.llamarpc.com";
        case "0x5":
            return "https://rpc.ankr.com/eth_goerli";
        case "0xa":
            return "https://mainnet.optimism.io";
        default:
            return "https://rpc.ankr.com/eth_goerli";
    }
};
