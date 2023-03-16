export const getRpc = (chainId: string) => {
    switch (chainId) {
        case '0x64':
            return 'https://rpc.ankr.com/gnosis'
        case '0x13881':
            return 'https://rpc.ankr.com/polygon_mumbai'
        case '0x89':
            return 'https://polygon.llamarpc.com'
        case '0x5':
            return 'https://rpc.ankr.com/eth_goerli'
        case '0x27d8':
            return 'https://rpc.eu-central-2.gateway.fm/v3/gnosis/archival/chiado'
        case '0xa':
            return 'https://mainnet.optimism.io'
        case '0x1A4':
            return 'https://goerli.optimism.io'
        default:
            return 'https://rpc.ankr.com/polygon_mumbai'
    }
}