"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-no-tick";
import Image from "next/image";
import { Network, Token, ccipRouters, networks, thirdwebClient, tokens, transmuters } from "@/lib/crypto";
import { Toggle } from "./ui/toggle";
import { Tabs, TabsContent } from "./ui/tabs";
import { useEffect, useState } from "react";
import TransactionButton from "./transaction-button";
import { PreparedTransaction, getAddress, getContract, prepareContractCall, readContract, toUnits } from "thirdweb";
import { decimals } from "thirdweb/extensions/erc20";
import { Abi, encodeAbiParameters } from "viem";
import { useActiveAccount } from "thirdweb/react";

export default function TransmuteCard() {
    const activeAccount = useActiveAccount();

    const [definedToken, setDefinedToken] = useState<Token | undefined>(undefined);

    const [srcToken, setSrcToken] = useState<string | undefined>(undefined);
    const [destToken, setDestToken] = useState<string | undefined>(undefined);
    const [customToken, setCustomToken] = useState<boolean>(false);

    const [srcNetwork, setSrcNetwork] = useState<Network | undefined>(undefined);
    const [destNetwork, setDestNetwork] = useState<Network | undefined>(undefined);

    const [amount, setAmount] = useState<number>(0);

    const [transmuteTx, setTransmuteTx] = useState<PreparedTransaction<Abi> | undefined>(undefined);

    useEffect(() => {
        if (!customToken) {
            if (definedToken && srcNetwork && destNetwork) {
                if (srcNetwork) {
                    const srcAddress = definedToken.addresses.get(srcNetwork.chain.id);
                    if (srcAddress) {
                        setSrcToken(srcAddress);
                    }
                }

                if (destNetwork) {
                    const destAddress = definedToken.addresses.get(destNetwork.chain.id);
                    if (destAddress) {
                        setDestToken(destAddress);
                    }
                }
            }
        }

        const prepareTransmuteTx = async () => {
            if (srcToken && destToken && srcNetwork && destNetwork && activeAccount) {
                const srcTransmuterAddress = transmuters.get(srcNetwork.chain.id);
                const destTransmuterAddress = transmuters.get(destNetwork.chain.id);

                if (srcTransmuterAddress && destTransmuterAddress) {
                    const srcTokenContract = getContract({
                        client: thirdwebClient,
                        chain: srcNetwork.chain,
                        address: srcToken
                    });
                    const tokenDecimals = await decimals({
                        contract: srcTokenContract
                    });
                    const amountUnits = toUnits(amount.toString(), tokenDecimals);

                    const ccipRouterAddress = ccipRouters.get(srcNetwork.chain.id);

                    if (ccipRouterAddress) {
                        const ccipContract = getContract({
                            client: thirdwebClient,
                            chain: srcNetwork.chain,
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
                            { name: "srcToken", type: "address" },
                            { name: "destToken", type: "address" },
                            { name: "amount", type: "uint256" },
                            { name: "receiver", type: "address" },
                        ];
                        const messageValues = [
                            srcToken,
                            destToken,
                            amountUnits,
                            activeAccount.address
                        ];
                        const messageEncoded = encodeAbiParameters(messageParams, messageValues);

                        const dataParams = [
                            { type: "uint256" },
                            { type: "bytes" }
                        ];
                        const dataValues = [1n, messageEncoded];
                        const dataEncoded = encodeAbiParameters(dataParams, dataValues);

                        const extraArgParams = [
                            { name: "gasLimit", type: "uint256" },
                            { name: "strict", type: "bool" },
                        ];
                        const extraArgValues = [500000n, false];
                        const extraArgEncoded = encodeAbiParameters(extraArgParams, extraArgValues);
                        // 0x97a657c9 function selector
                        const extraArgEncodedWithSelector: `0x${string}` = `0x${"97a657c9" + extraArgEncoded.slice(2)}`;

                        const ccipFee = await readContract({
                            contract: ccipContract,
                            method: "getFee",
                            params: [
                                destNetwork.ccipSelector,
                                {
                                    receiver: getAddress(destTransmuterAddress),
                                    data: dataEncoded,
                                    tokenAmounts: [],
                                    feeToken: "0x0000000000000000000000000000000000000000",
                                    extraArgs: extraArgEncodedWithSelector
                                }
                            ]
                        });

                        const srcTransmuterContract = getContract({
                            client: thirdwebClient,
                            chain: srcNetwork.chain,
                            address: srcTransmuterAddress,
                            abi: [{
                                "inputs": [
                                    {
                                        "components": [
                                            {
                                                "internalType": "address",
                                                "name": "srcToken",
                                                "type": "address"
                                            },
                                            {
                                                "internalType": "uint256",
                                                "name": "amount",
                                                "type": "uint256"
                                            },
                                            {
                                                "internalType": "address",
                                                "name": "destToken",
                                                "type": "address"
                                            },
                                            {
                                                "internalType": "uint64",
                                                "name": "destChain",
                                                "type": "uint64"
                                            },
                                            {
                                                "internalType": "address",
                                                "name": "destReceiver",
                                                "type": "address"
                                            },
                                            {
                                                "internalType": "address",
                                                "name": "feeToken",
                                                "type": "address"
                                            },
                                            {
                                                "internalType": "uint256",
                                                "name": "gasLimit",
                                                "type": "uint256"
                                            }
                                        ],
                                        "internalType": "struct ITransmuter.TransmuteParams",
                                        "name": "params",
                                        "type": "tuple"
                                    }
                                ],
                                "name": "transmute",
                                "outputs": [
                                    {
                                        "internalType": "bytes32",
                                        "name": "requestId",
                                        "type": "bytes32"
                                    }
                                ],
                                "stateMutability": "payable",
                                "type": "function"
                            }]
                        });
    
                        setTransmuteTx(prepareContractCall({
                            contract: srcTransmuterContract,
                            method: "transmute",
                            params: [{
                                srcToken: srcToken,
                                amount: amountUnits,
                                destToken: destToken,
                                destChain: destNetwork.ccipSelector,
                                destReceiver: activeAccount.address,
                                feeToken: "0x0000000000000000000000000000000000000000",
                                gasLimit: 500000n
                            }],
                            value: ccipFee + (ccipFee / 1000n)
                        }));
                    }
                }
            }
        };

        prepareTransmuteTx().catch((error) => console.log(error));
    }, [
        customToken,
        definedToken,
        srcToken,
        destToken,
        srcNetwork,
        destNetwork,
        amount,
        setSrcToken,
        setDestToken,
        setTransmuteTx
    ]);

    return (
        <Card
            className="p-6"
        >
            <div
                className="text-lg mb-2"
            >
                Networks
            </div>
            <div
                className="text-sm text-muted-foreground"
            >
                From
            </div>
            <Select
                onValueChange={(value) => {
                    setSrcNetwork(networks.get(Number(value)));
                }}
                value={srcNetwork?.chain.id.toString()}
            >
                <SelectTrigger>
                    <SelectValue
                        placeholder="Select"
                    />
                </SelectTrigger>
                <SelectContent>
                    {[...networks.values()].map((network, index) => (
                        <SelectItem
                            key={index}
                            value={network.chain.id.toString()}
                        >
                            <div
                                className="flex flex-row items-center space-x-2"
                            >
                                <div
                                    className="w-5 h-5 relative"
                                >
                                    <Image
                                        src={network.icon}
                                        alt=""
                                        fill
                                    />
                                </div>
                                <div>
                                    {network.name}
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div
                className="text-sm text-muted-foreground mt-2"
            >
                To
            </div>
            <Select
                onValueChange={(value) => {
                    setDestNetwork(networks.get(Number(value)));
                }}
                value={destNetwork?.chain.id.toString()}
            >
                <SelectTrigger>
                    <SelectValue
                        placeholder="Select"
                    />
                </SelectTrigger>
                <SelectContent>
                    {[...networks.values()].map((network, index) => (
                        <SelectItem
                            key={index}
                            value={network.chain.id.toString()}
                        >
                            <div
                                className="flex flex-row items-center space-x-2"
                            >
                                <div
                                    className="w-5 h-5 relative"
                                >
                                    <Image
                                        src={network.icon}
                                        alt=""
                                        fill
                                    />
                                </div>
                                <div>
                                    {network.name}
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div
                className="flex flex-row items-center justify-between mt-8 mb-2"
            >
                <div
                    className="text-lg"
                >
                    Token
                </div>
                <Toggle
                    className="h-fit px-2 py-1 text-xs"
                    variant="outline"
                    onClick={() => {
                        setCustomToken(!customToken);
                        setSrcToken(undefined);
                        setDestToken(undefined);
                        setDefinedToken(undefined);
                    }}
                    value={customToken ? "default" : "outline"}
                >
                    Custom token
                </Toggle>
            </div>
            <Tabs
                value={customToken ? "custom" : "defined"}
            >
                <TabsContent
                    value="defined"
                >
                    <Select
                        onValueChange={(tokenSymbol) => {
                            setDefinedToken([...tokens.values()].find(
                                token => token.symbol === tokenSymbol
                            ));
                        }}
                        value={definedToken?.symbol}
                    >
                        <SelectTrigger>
                            <SelectValue
                                placeholder="Select"
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {[...tokens.values()].map((token, index) => (
                                <SelectItem
                                    key={index}
                                    value={token.symbol}
                                >
                                    <div
                                        className="flex flex-row items-center space-x-2"
                                    >
                                        <div
                                            className="w-5 h-5 relative"
                                        >
                                            <Image
                                                src={token.icon}
                                                alt=""
                                                fill
                                            />
                                        </div>
                                        <div>
                                            {token.symbol}
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </TabsContent>
                <TabsContent
                    value="custom"
                    className="space-y-2"
                >
                    <div>
                        <div
                            className="text-sm text-muted-foreground"
                        >
                            From
                        </div>
                        <Input
                            placeholder="Token address"
                            className="overflow-ellipsis"
                            onChange={(e) => {
                                setSrcToken(e.currentTarget.value);
                            }}
                            value={srcToken}
                        />
                    </div>
                    <div>
                        <div
                            className="text-sm text-muted-foreground"
                        >
                            To
                        </div>
                        <Input
                            placeholder="Token address"
                            className="overflow-ellipsis"
                            onChange={(e) => {
                                setDestToken(e.currentTarget.value);
                            }}
                            value={destToken}
                        />
                    </div>
                </TabsContent>
            </Tabs>
            <div
                className="text-sm text-muted-foreground mt-2"
            >
                Amount
            </div>
            <Card
                className="flex flex-row items-center mb-8"
            >
                <Input
                    type="number"
                    placeholder="Amount"
                    className="bg-transparent border-0 focus-visible:ring-offset-0 focus-visible:ring-0 overflow-ellipsis"
                    onChange={(e) => { setAmount(Number(e.currentTarget.value)) }}
                    value={amount}
                    min={0}
                />
                <Button
                    type="button"
                    variant="outline"
                    className="text-xs px-2 h-6 rounded-full mr-2"
                >
                    MAX
                </Button>
            </Card>
            <TransactionButton
                requiredAllowance={amount}
                tokenAddress={srcToken}
                chain={srcNetwork?.chain}
                transaction={transmuteTx}
                label="Transmute"
                toastLabel="Transmute transaction"
            />
        </Card>
    );
}