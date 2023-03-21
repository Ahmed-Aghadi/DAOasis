export function parseAbiToFunction(abi: string): any {
    try {
        const parsedAbi = JSON.parse(abi);
        const functionAbi = parsedAbi.filter(
            (abi: any) =>
                abi.type === "function" &&
                abi.stateMutability !== "view" &&
                abi.stateMutability !== "pure"
        );
        const functionAbiMap = functionAbi.map((abi: any) => {
            return {
                name: abi.name,
                inputs:
                    abi.inputs?.map((input: any) => ({
                        name: input.name,
                        type: input.type,
                    })) || [],
                stateMutability: abi.stateMutability,
            };
        });
        return functionAbiMap;
    } catch (e) {
        throw new Error("Invalid ABI");
    }
}
