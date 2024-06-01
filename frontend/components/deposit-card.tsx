"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-no-tick";
import Image from "next/image";
import { Network, Token, networks, thirdwebClient, tokens, transmuters } from "@/lib/crypto";
import { Toggle } from "./ui/toggle";
import { Tabs, TabsContent } from "./ui/tabs";
import { useEffect, useState } from "react";
import TransactionButton from "./transaction-button";
import { PreparedTransaction, getContract, prepareContractCall, toUnits } from "thirdweb";
import { decimals } from "thirdweb/extensions/erc20";
import { Abi } from "viem";

export default function DepositCard() {
    const [definedToken, setDefinedToken] = useState<Token | undefined>(undefined);

    const [srcToken, setSrcToken] = useState<string | undefined>(undefined);
    const [destToken, setDestToken] = useState<string | undefined>(undefined);
    const [customToken, setCustomToken] = useState<boolean>(false);

    const [srcNetwork, setSrcNetwork] = useState<Network | undefined>(undefined);
    const [destNetwork, setDestNetwork] = useState<Network | undefined>(undefined);

    const [amount, setAmount] = useState<number>(0);

    const [depositTx, setDepositTx] = useState<PreparedTransaction<Abi> | undefined>(undefined);

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

        const prepareDepositTx = async () => {
            if (srcToken && destToken && srcNetwork && destNetwork) {
                const srcTokenContract = getContract({
                    client: thirdwebClient,
                    chain: srcNetwork.chain,
                    address: srcToken
                });

                const tokenDecimals = await decimals({
                    contract: srcTokenContract
                });

                const amountUnits = toUnits(amount.toString(), tokenDecimals);

                const srcTransmuterAddress = transmuters.get(srcNetwork.chain.id);

                if (srcTransmuterAddress) {
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
                                            "internalType": "uint256",
                                            "name": "amount",
                                            "type": "uint256"
                                        }
                                    ],
                                    "internalType": "struct ITransmuter.DepositParams",
                                    "name": "params",
                                    "type": "tuple"
                                }
                            ],
                            "name": "deposit",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "depositId",
                                    "type": "uint256"
                                }
                            ],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        }]
                    });

                    setDepositTx(prepareContractCall({
                        contract: srcTransmuterContract,
                        method: "deposit",
                        params: [{
                            srcToken: srcToken,
                            destToken: destToken,
                            destChain: destNetwork.ccipSelector,
                            amount: amountUnits
                        }]
                    }));
                }
            }
        };

        prepareDepositTx().catch((error) => console.log(error));
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
        setDepositTx
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
                transaction={depositTx}
                label="Deposit"
            />
        </Card>
    );
}