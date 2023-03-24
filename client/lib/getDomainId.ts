export const getDomainId = (chainId: string) => {
    switch (chainId) {
        case "0x64":
            return 6778479;
        case "0x89":
            return 1886350457;
        case "0x5":
            return 1735353714;
        case "0xa":
            return 1869640809;
        case "0x13881":
            return 9991;
        case "0x1A4":
            return 1735356532;
        default:
            return 1735353714;
    }
};
