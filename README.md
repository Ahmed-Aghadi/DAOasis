# scaling-eth

DAOasis is a social platform designed to simplify the management of digital assets, allowing users to create and manage multisigs, handle custom transactions, and conduct cross-chain interactions. The app was built using a range of cutting-edge technologies, including Polybase decentralized database, web2 authentication, Gnosis Safe wallet, and Connext cross-chain communication.

Polybase was used to store all data related to the app, providing a secure and decentralized method for storing and accessing data. Web3 authentication was implemented to onboard web2 users and create decentralized wallets based on the erc4337 standard account abstraction. This simplifies the management of digital assets, making it easy for users to create and manage their accounts.

Gnosis Safe wallet was used to create accounts under the hood for web2 users and to create safes. The Safe is a multi-sig wallet that requires a certain minimum number of signatures to execute a transaction. This ensures that all transactions are secure and that all parties involved in the transaction have authorized it.

Connext was used to enable cross-chain transactions and fund transfer using the zodiac-connext module for the Safe created. DAOasis currently supports Gnosis Chain, Polygon, Optimism Mainnet, and Goerli Testnet, allowing users to conduct transactions across multiple chains.

Overall, DAOasis provides a comprehensive solution for streamlining workflow and managing digital assets, making it easy for users to create and manage their accounts, conduct transactions, and interact across multiple chains. By leveraging cutting-edge technologies like Polybase, web3 authentication, Gnosis Safe wallet, and Connext cross-chain communication, the app offers a secure and efficient solution for managing digital assets in a decentralized manner.

## Sponsors Used

### Polybase

[Polybase API](https://github.com/Suhel-Kap/DAOasis/blob/main/client/pages/api/polybase/index.ts)

[Polybase Explorer - User](https://explorer.testnet.polybase.xyz/collections/polybase-test-v0.2%2FUser)

[Polybase Explorer - App](https://explorer.testnet.polybase.xyz/collections/polybase-test-v0.2%2FApp)

[Polybase Explorer - MultiSig](https://explorer.testnet.polybase.xyz/collections/polybase-test-v0.2%2FMultiSig)

[Polybase Explorer - MultiSigProposals](https://explorer.testnet.polybase.xyz/collections/polybase-test-v0.2%2FMultiSigProposals)

[Polybase Explorer - Reply](https://explorer.testnet.polybase.xyz/collections/polybase-test-v0.2%2FReply)


### Connext

[Connext Contract](https://github.com/Suhel-Kap/DAOasis/blob/main/DAOasis-ZodiacXconnext/contracts/DAOasisModule.sol)

[Connext Cross Chain Transaction](https://github.com/Suhel-Kap/DAOasis/blob/main/client/lib/getCrossChainTransaction.ts)

[Connext Get Domain ID](https://github.com/Suhel-Kap/DAOasis/blob/main/client/lib/getDomainId.ts)

[Connext Get Address](https://github.com/Suhel-Kap/DAOasis/blob/main/client/lib/getConnextAddress.ts)

[Connext Get Weth Address](https://github.com/Suhel-Kap/DAOasis/blob/main/client/lib/getWethAddress.ts)
