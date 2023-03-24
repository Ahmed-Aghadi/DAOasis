export const getWethAddress = (chainId: string) => {
    switch (chainId) {
        case "0x64":
            return "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1";
        case "0x89":
            return "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
        case "0x5":
            return "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
        case "0xa":
            return "0x4200000000000000000000000000000000000006";
        case "0x13881":
            return "0xFD2AB41e083c75085807c4A65C0A14FDD93d55A9";
        case "0x1A4":
            return "0x74c6FD7D2Bc6a8F0Ebd7D78321A95471b8C2B806";
        default:
            return "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
    }
};
