export const getConnextAddress = (chainId: string) => {
    switch (chainId) {
        case "0x64":
            return "0x5bB83e95f63217CDa6aE3D181BA580Ef377D2109";
        case "0x89":
            return "0x11984dc4465481512eb5b777E44061C158CF2259";
        case "0x5":
            return "0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649";
        case "0xa":
            return "0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA";
        case "0x13881":
            return "0x2334937846Ab2A3FCE747b32587e1A1A2f6EEC5a";
        case "0x1A4":
            return "0x5Ea1bb242326044699C3d81341c5f535d5Af1504";
        default:
            return "0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649";
    }
};
