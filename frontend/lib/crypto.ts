import { createThirdwebClient, getContract, sendTransaction, toUnits, waitForReceipt } from "thirdweb";
import { sepolia, baseSepolia, polygonAmoy, avalancheFuji, Chain } from "thirdweb/chains";
import { allowance, approve, decimals } from "thirdweb/extensions/erc20";
import { Account } from "thirdweb/wallets";

export interface Network {
    name: string;
    icon: string;
    chain: Chain;
    ccipSelector: bigint;
}

export interface Token {
    icon: string;
    addresses: Map<number, string>;
    decimals: number;
    symbol: string;
    name: string;
}

export const networks = new Map<number, Network>([
    [sepolia.id, {
        name: "Ethereum Sepolia",
        icon: "/crypto/networks/Eth.svg",
        chain: sepolia,
        ccipSelector: 16015286601757825753n
    }],
    [baseSepolia.id, {
        name: "Base Sepolia",
        icon: "/crypto/networks/Base.svg",
        chain: baseSepolia,
        ccipSelector: 10344971235874465080n
    }],
    [polygonAmoy.id, {
        name: "Polygon Amoy",
        icon: "/crypto/networks/Polygon.svg",
        chain: polygonAmoy,
        ccipSelector: 16281711391670634445n
    }],
    [avalancheFuji.id, {
        name: "Avalanche Fuji",
        icon: "/crypto/networks/Avax.svg",
        chain: avalancheFuji,
        ccipSelector: 14767482510784806043n
    }],
]);

export const tokens = new Map<string, Token>([
    ["LINK", {
        icon: "/crypto/tokens/Link.svg",
        addresses: new Map<number, string>([
            [sepolia.id, "0x779877A7B0D9E8603169DdbD7836e478b4624789"],
            [baseSepolia.id, "0xE4aB69C077896252FAFBD49EFD26B5D171A32410"],
            [polygonAmoy.id, "0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904"],
            [avalancheFuji.id, "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846"],
        ]),
        decimals: 18,
        symbol: "LINK",
        name: "Chainlink"
    }],
    ["USDC", {
        icon: "/crypto/tokens/Usdc.svg",
        addresses: new Map<number, string>([
            [sepolia.id, "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"],
            [baseSepolia.id, "0x036CbD53842c5426634e7929541eC2318f3dCF7e"],
            [polygonAmoy.id, "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582"],
            [avalancheFuji.id, "0x5425890298aed601595a70ab815c96711a31bc65"],
        ]),
        decimals: 6,
        symbol: "USDC",
        name: "USDC"
    }]
]);

export const transmuters = new Map<number, string>([
    [sepolia.id, "0xCcBC48eDf4CDd3332e8c07c4CAB3ED374353Ba66"],
    [baseSepolia.id, "0x960B66DbF1B834B1fbe4969A0bEec9A1724b8379"],
    [polygonAmoy.id, "0xb5E56F92ebDEa6E74A8f9C3cA1Ab4Eaf5d8e93fC"],
    [avalancheFuji.id, "0x929765acFFB21BFb80d870955204173bDfBc92a5"],
]);

export const ccipRouters = new Map<number, string>([
    [sepolia.id, "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59"],
    [baseSepolia.id, "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93"],
    [polygonAmoy.id, "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2"],
    [avalancheFuji.id, "0xF694E193200268f9a4868e4Aa017A0118C9a8177"],
]);

export const thirdwebClient = createThirdwebClient({
    clientId: "121c4134033137bc824d6a5ee780240a",
});

export function CheckNetwork(activeWalletChain: Chain | undefined, chainId: number | undefined): boolean {
    if (activeWalletChain && chainId) {
        return activeWalletChain.id === chainId;
    }

    return false;
};

export async function SufficientAllowance(activeAccount: Account | undefined, chain: Chain | undefined, tokenAddress: string | undefined, amount: number | undefined): Promise<boolean> {
    if(activeAccount && chain && tokenAddress && amount) {
        const transmuter = transmuters.get(chain.id);

        if(transmuter) {
            const token = getContract({
                client: thirdwebClient,
                chain: chain,
                address: tokenAddress
            });
    
            const allowanceAmount = await allowance({
                contract: token,
                owner: activeAccount.address,
                spender: transmuter
            });

            const tokenDecimals = await decimals({
                contract: token
            });
    
            const amountUnits = toUnits(amount.toString(), tokenDecimals);
    
            return allowanceAmount >= amountUnits;
        }
    }
    
    return false;
};

export async function ApproveSpending(activeAccount: Account | undefined, chain: Chain | undefined, tokenAddress: string | undefined, amount: number | undefined): Promise<string | undefined> {
    if(activeAccount && chain && tokenAddress && amount) {
        const transmuter = transmuters.get(chain.id);

        if(transmuter) {
            const token = getContract({
                client: thirdwebClient,
                chain: chain,
                address: tokenAddress
            });

            const tokenDecimals = await decimals({
                contract: token
            });

            const amountUnits = toUnits(amount.toString(), tokenDecimals);

            const approveTx = approve({
                contract: token,
                spender: transmuter,
                amountWei: amountUnits
            });

            try {
                const txRecipt = await sendTransaction({
                    account: activeAccount,
                    transaction: approveTx
                });
    
                await waitForReceipt({
                    client: thirdwebClient,
                    chain: chain,
                    transactionHash: txRecipt.transactionHash
                });

                return txRecipt.transactionHash;
            } catch(err) {
                console.log(err);
            }
        }
    
        return undefined;
    }
}