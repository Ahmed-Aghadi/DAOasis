export const getChainDetails = (chainId: string) => {
    switch (chainId) {
        case "0x64":
            return {
                name: "Gnosis",
                token: "XDAI",
                explorer: "https://gnosisscan.io/"
            }
        case "0x89":
            return {
                name: "Polygon",
                token: "MATIC",
                explorer: "https://polygonscan.com/"
            }
        case "0x5":
            return {
                name: "Goerli",
                token: "GoerliETH",
                explorer: "https://goerli.etherscan.io/"
            }
        case "0xa":
            return {
                name: "Optimism",
                token: "ETH",
                explorer: "https://optimistic.etherscan.io/"
            }
        default:
            return {
                name: "Goerli",
                token: "GoerliETH",
                explorer: "https://goerli.etherscan.io/"
            }
    }
}