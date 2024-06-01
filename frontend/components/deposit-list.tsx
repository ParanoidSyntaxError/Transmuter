"use client";

import { Network, Token, ccipRouters, networks, tokens, transmuters } from "@/lib/crypto";
import { ParseEventLogsResult, PreparedEvent, createThirdwebClient, getAddress, getContract, prepareContractCall, prepareEvent, readContract, sendTransaction, toTokens } from "thirdweb";
import { useActiveAccount, useActiveWalletChain, useContractEvents, useSwitchActiveWalletChain } from "thirdweb/react";
import { AbiEvent, encodeAbiParameters } from "viem";
import { Card } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";

const client = createThirdwebClient({
    clientId: "121c4134033137bc824d6a5ee780240a",
});

interface DepositEventArgs {
    amount: bigint;
    depositId: bigint;
    depositor: string;
    destChain: bigint;
    destToken: string;
    srcToken: string;
}

interface Deposit {
    srcNetwork: Network;
    destNetwork: Network;
    srcToken: Token;
    amount: string;
    eventArgs: DepositEventArgs;
}

export default function DepositList() {
    const activeAccount = useActiveAccount();
    const activeWalletChain = useActiveWalletChain();
    const switchChain = useSwitchActiveWalletChain();

    const allEvents = new Map<number, ParseEventLogsResult<[PreparedEvent<AbiEvent>], true>>();
    const deposits: Deposit[] = [];

    transmuters.forEach((transmuterAddress, chainId) => {
        const network = networks.get(chainId);

        if (network) {
            const contract = getContract({
                client: client,
                chain: network?.chain,
                address: transmuterAddress,
                abi: [
                    { "inputs": [{ "internalType": "uint64", "name": "chain", "type": "uint64" }, { "internalType": "address", "name": "router", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "address", "name": "router", "type": "address" }], "name": "InvalidRouter", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "depositId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "srcToken", "type": "address" }, { "indexed": false, "internalType": "uint64", "name": "destChain", "type": "uint64" }, { "indexed": false, "internalType": "address", "name": "destToken", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "depositor", "type": "address" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bytes32", "name": "requestId", "type": "bytes32" }, { "indexed": false, "internalType": "address", "name": "srcToken", "type": "address" }, { "indexed": false, "internalType": "uint64", "name": "destChain", "type": "uint64" }, { "indexed": false, "internalType": "address", "name": "destToken", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "destReceiver", "type": "address" }], "name": "Transmute", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "depositId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "srcAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "destAmount", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "srcReceiver", "type": "address" }, { "indexed": false, "internalType": "address", "name": "destReceiver", "type": "address" }, { "indexed": false, "internalType": "bytes32", "name": "requestId", "type": "bytes32" }], "name": "Withdraw", "type": "event" }, { "inputs": [{ "components": [{ "internalType": "bytes32", "name": "messageId", "type": "bytes32" }, { "internalType": "uint64", "name": "sourceChainSelector", "type": "uint64" }, { "internalType": "bytes", "name": "sender", "type": "bytes" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "components": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "internalType": "struct Client.EVMTokenAmount[]", "name": "destTokenAmounts", "type": "tuple[]" }], "internalType": "struct Client.Any2EVMMessage", "name": "message", "type": "tuple" }], "name": "ccipReceive", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "ccipRouter", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "chainSelector", "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "srcToken", "type": "address" }, { "internalType": "address", "name": "destToken", "type": "address" }, { "internalType": "uint64", "name": "destChain", "type": "uint64" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "internalType": "struct ITransmuter.DepositParams", "name": "params", "type": "tuple" }], "name": "deposit", "outputs": [{ "internalType": "uint256", "name": "depositId", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "srcToken", "type": "address" }, { "internalType": "uint64", "name": "destChain", "type": "uint64" }, { "internalType": "address", "name": "destToken", "type": "address" }, { "internalType": "uint256", "name": "epochId", "type": "uint256" }], "name": "epoch", "outputs": [{ "components": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "turnover", "type": "uint256" }, { "internalType": "uint256", "name": "fees", "type": "uint256" }], "internalType": "struct ITransmuter.Epoch", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint64", "name": "chain", "type": "uint64" }], "name": "getCcipRouter", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getRouter", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint64", "name": "chain", "type": "uint64" }], "name": "getTransmuter", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint64[]", "name": "chains", "type": "uint64[]" }, { "internalType": "address[]", "name": "routers", "type": "address[]" }], "name": "setCcipRouters", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint64[]", "name": "chains", "type": "uint64[]" }, { "internalType": "address[]", "name": "transmuters", "type": "address[]" }], "name": "setTransmuters", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "totalDeposits", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "srcToken", "type": "address" }, { "internalType": "uint64", "name": "destChain", "type": "uint64" }, { "internalType": "address", "name": "destToken", "type": "address" }], "name": "totalEpochs", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "srcToken", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "address", "name": "destToken", "type": "address" }, { "internalType": "uint64", "name": "destChain", "type": "uint64" }, { "internalType": "address", "name": "destReceiver", "type": "address" }, { "internalType": "address", "name": "feeToken", "type": "address" }, { "internalType": "uint256", "name": "gasLimit", "type": "uint256" }], "internalType": "struct ITransmuter.TransmuteParams", "name": "params", "type": "tuple" }], "name": "transmute", "outputs": [{ "internalType": "bytes32", "name": "requestId", "type": "bytes32" }], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "transmuteFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "uint256", "name": "depositId", "type": "uint256" }, { "internalType": "address", "name": "srcReceiver", "type": "address" }, { "internalType": "address", "name": "destReceiver", "type": "address" }, { "internalType": "uint256", "name": "gasLimit", "type": "uint256" }, { "internalType": "address", "name": "feeToken", "type": "address" }], "internalType": "struct ITransmuter.WithdrawParams", "name": "params", "type": "tuple" }], "name": "withdraw", "outputs": [{ "internalType": "bytes32", "name": "requestId", "type": "bytes32" }], "stateMutability": "nonpayable", "type": "function" }
                ]
            });

            if (contract) {
                const eventData = useContractEvents({
                    contract: contract,
                    events: [prepareEvent({
                        signature: "event Deposit(uint256 depositId, address srcToken, uint64 destChain, address destToken, uint256 amount, address depositor)",
                    })],
                    blockRange: 100000,
                }).data;

                if (eventData && eventData.length > 0) {
                    allEvents.set(chainId, eventData);
                }
            }
        }
    });

    if (activeAccount) {
        [...allEvents.entries()].forEach(([chainId, depoEvents]) => {
            depoEvents.forEach((event) => {
                const eventArgs = event.args as unknown as DepositEventArgs;

                if (eventArgs.depositor === activeAccount.address) {
                    const srcNetwork = networks.get(chainId);
                    const destNetwork = [...networks.values()].find((value) => value.ccipSelector === eventArgs.destChain);

                    const token = [...tokens.values()].find((t) => [...t.addresses.values()].find((a) => a === eventArgs.srcToken));

                    if (srcNetwork && destNetwork && token) {
                        deposits.push({
                            srcNetwork: srcNetwork,
                            destNetwork: destNetwork,
                            srcToken: token,
                            amount: toTokens(eventArgs.amount, token.decimals),
                            eventArgs: eventArgs
                        })
                    }
                }
            })
        });
    }

    const checkNetwork = (srcChainId: number) => {
        return activeWalletChain?.id === srcChainId;
    };

    const handleWithdraw = async (deposit: Deposit) => {
        const srcTransmuterAddress = transmuters.get(deposit.srcNetwork.chain.id);
        const destTransmuterAddress = transmuters.get(deposit.destNetwork.chain.id);
        const ccipRouterAddress = ccipRouters.get(deposit.srcNetwork.chain.id);

        if (srcTransmuterAddress && destTransmuterAddress && ccipRouterAddress && activeAccount) {
            const ccipContract = getContract({
                client: client,
                chain: deposit.srcNetwork.chain,
                address: ccipRouterAddress,
                abi: [{
                    "inputs": [
                        {
                            "internalType": "uint64",
                            "name": "destinationChainSelector",
                            "type": "uint64"
                        },
                        {
                            "components": [
                                {
                                    "internalType": "bytes",
                                    "name": "receiver",
                                    "type": "bytes"
                                },
                                {
                                    "internalType": "bytes",
                                    "name": "data",
                                    "type": "bytes"
                                },
                                {
                                    "components": [
                                        {
                                            "internalType": "address",
                                            "name": "token",
                                            "type": "address"
                                        },
                                        {
                                            "internalType": "uint256",
                                            "name": "amount",
                                            "type": "uint256"
                                        }
                                    ],
                                    "internalType": "struct Client.EVMTokenAmount[]",
                                    "name": "tokenAmounts",
                                    "type": "tuple[]"
                                },
                                {
                                    "internalType": "address",
                                    "name": "feeToken",
                                    "type": "address"
                                },
                                {
                                    "internalType": "bytes",
                                    "name": "extraArgs",
                                    "type": "bytes"
                                }
                            ],
                            "internalType": "struct Client.EVM2AnyMessage",
                            "name": "message",
                            "type": "tuple"
                        }
                    ],
                    "name": "getFee",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "fee",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }]
            });

            const messageParams = [
                { name: "token", type: "address" },
                { name: "amount", type: "uint256" },
                { name: "receiver", type: "address" },
            ];
            const messageValues = [deposit.eventArgs.destToken, deposit.amount, activeAccount.address];
            const messageEncoded = encodeAbiParameters(messageParams, messageValues);

            const dataParams = [
                { type: "uint256" },
                { type: "bytes" }
            ];
            const dataValues = [0n, messageEncoded];
            const dataEncoded = encodeAbiParameters(dataParams, dataValues);

            const extraArgParams = [
                { name: "gasLimit", type: "uint256" },
                { name: "strict", type: "bool" },
            ];
            const extraArgValues = [500000n, false];
            const extraArgEncoded = encodeAbiParameters(extraArgParams, extraArgValues);
            const extraArgEncodedWithSelector: `0x${string}` = `0x${"97a657c9" + extraArgEncoded.slice(2)}`;

            const ccipFee = await readContract({
                contract: ccipContract,
                method: "getFee",
                params: [
                    deposit.destNetwork.ccipSelector,
                    {
                        receiver: getAddress(destTransmuterAddress),
                        data: dataEncoded,
                        tokenAmounts: [],
                        feeToken: "0x0000000000000000000000000000000000000000",
                        extraArgs: extraArgEncodedWithSelector
                    }
                ]
            });

            const contract = getContract({
                client: client,
                chain: deposit.srcNetwork.chain,
                address: srcTransmuterAddress,
                abi: [{
                    "inputs": [
                        {
                            "components": [
                                {
                                    "internalType": "uint256",
                                    "name": "depositId",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "srcReceiver",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "destReceiver",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "gasLimit",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "feeToken",
                                    "type": "address"
                                }
                            ],
                            "internalType": "struct ITransmuter.WithdrawParams",
                            "name": "params",
                            "type": "tuple"
                        }
                    ],
                    "name": "withdraw",
                    "outputs": [
                        {
                            "internalType": "bytes32",
                            "name": "requestId",
                            "type": "bytes32"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }]
            });

            const txn = prepareContractCall({
                contract: contract,
                method: "withdraw",
                params: [{
                    depositId: deposit.eventArgs.depositId,
                    srcReceiver: deposit.eventArgs.depositor,
                    destReceiver: deposit.eventArgs.depositor,
                    feeToken: "0x0000000000000000000000000000000000000000",
                    gasLimit: 500000n,
                }],
                value: ccipFee
            });

            await sendTransaction({
                account: activeAccount,
                transaction: txn
            })
        }
    };

    const WithdrawButton = (deposit: Deposit) => {
        if (!checkNetwork(deposit.srcNetwork.chain.id)) {
            return (
                <Button
                    variant="outline"
                    onClick={() => { switchChain(deposit.srcNetwork.chain) }}
                >
                    Switch network
                </Button>
            );
        }

        return (
            <Button
                variant="secondary"
                onClick={() => { handleWithdraw(deposit) }}
            >
                Withdraw
            </Button>
        );
    };

    return (
        <div
            className="space-y-6"
        >
            {deposits.map((deposit, index) => (
                <Card
                    key={index}
                    className="p-3"
                >
                    <div
                        className="flex flex-row justify-between"
                    >
                        <div
                            className="flex flex-row items-center space-x-1 text-sm"
                        >
                            <div
                                className="w-4 h-4 relative"
                            >
                                <Image
                                    src={deposit.srcNetwork.icon}
                                    alt=""
                                    fill
                                />
                            </div>
                            <div>
                                {deposit.srcNetwork.name}
                            </div>
                            <div
                                className="px-1"
                            >
                                {"=>"}
                            </div>
                            <div
                                className="w-4 h-4 relative"
                            >
                                <Image
                                    src={deposit.destNetwork.icon}
                                    alt=""
                                    fill
                                />
                            </div>
                            <div>
                                {deposit.destNetwork.name}
                            </div>
                        </div>
                        <div
                            className="text-muted-foreground text-xs"
                        >
                            ID: {deposit.eventArgs.depositId.toString()}
                        </div>
                    </div>

                    <div
                        className="flex flex-row justify-between items-end"
                    >
                        <div>
                            <div
                                className="flex flex-row items-center space-x-2 mt-4"
                            >
                                <div>
                                    <div
                                        className="w-8 h-8 relative"
                                    >
                                        <Image
                                            src={deposit.srcToken.icon}
                                            alt=""
                                            fill
                                        />
                                    </div>
                                </div>
                                <div
                                    className="text-2xl font-semibold"
                                >
                                    {deposit.srcToken.name}
                                </div>
                            </div>
                            <div
                                className="mt-1"
                            >
                                Amount: {deposit.amount}
                            </div>
                        </div>
                        {WithdrawButton(deposit)}
                    </div>
                </Card>
            ))}
        </div>
    );
}