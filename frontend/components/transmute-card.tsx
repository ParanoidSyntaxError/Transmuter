"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-no-tick";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { ccipRouters, networks, tokens, transmuters } from "@/lib/crypto";
import { createThirdwebClient, prepareContractCall, getContract, sendTransaction, toUnits, waitForReceipt, readContract, getAddress, toHex, toBytes, encode } from "thirdweb";
import { useActiveAccount, useActiveWalletChain, useSwitchActiveWalletChain } from "thirdweb/react";
import { allowance, approve } from "thirdweb/extensions/erc20";
import { useState } from "react";
import { encodeAbiParameters } from "viem";

const transmuteSchema = z.object({
    token: z.string(),
    srcChain: z.string(),
    destChain: z.string(),
    amount: z.number(),
})

const client = createThirdwebClient({
    clientId: "121c4134033137bc824d6a5ee780240a",
});

export default function TransmuteCard() {
    const form = useForm<z.infer<typeof transmuteSchema>>({
        resolver: zodResolver(transmuteSchema),
        defaultValues: {
            amount: 0
        },
        reValidateMode: "onBlur"
    });
    form.watch();

    const activeAccount = useActiveAccount();
    const activeWalletChain = useActiveWalletChain();
    const switchChain = useSwitchActiveWalletChain();

    const [hasAllowance, setHasAllowance] = useState<boolean>(false);
    const [approvePending, setApprovePending] = useState<boolean>(false);

    const checkNetwork = () => {
        const srcChainId = Number(form.getValues("srcChain"));
        const srcNetwork = networks.get(srcChainId);

        if (srcNetwork && activeWalletChain?.id !== srcNetwork.chain.id) {
            return false;
        }

        return true;
    };

    const checkAllowance = async () => {
        const srcChainId = Number(form.getValues("srcChain"));
        const srcNetwork = networks.get(srcChainId);

        const token = tokens.get(form.getValues("token"));
        const tokenAddress = token?.addresses.get(srcChainId);

        const transmuter = transmuters.get(srcChainId);

        if (activeAccount && srcNetwork && token && tokenAddress && transmuter) {
            const contract = getContract({
                client: client,
                chain: srcNetwork.chain,
                address: tokenAddress
            });

            const allowanceAmount = await allowance({
                contract: contract,
                owner: activeAccount.address,
                spender: transmuter
            });

            const amount = toUnits(form.getValues("amount").toString(), token.decimals);

            if (allowanceAmount >= amount) {
                setHasAllowance(true);
                return true;
            }
        }

        setHasAllowance(false);
        return false;
    };

    const handleApprove = async () => {
        const srcChainId = Number(form.getValues("srcChain"));
        const srcNetwork = networks.get(srcChainId);

        const token = tokens.get(form.getValues("token"));
        const tokenAddress = token?.addresses.get(srcChainId);

        const transmuter = transmuters.get(srcChainId);

        if (activeAccount && srcNetwork && token && tokenAddress && transmuter) {
            const contract = getContract({
                client: client,
                chain: srcNetwork.chain,
                address: tokenAddress
            });

            const amount = toUnits(form.getValues("amount").toString(), token.decimals);

            const txn = approve({
                contract: contract,
                spender: transmuter,
                amountWei: amount
            });

            setApprovePending(true);

            try {
                const res = await sendTransaction({
                    account: activeAccount,
                    transaction: txn
                });

                await waitForReceipt({
                    client: client,
                    chain: srcNetwork.chain,
                    transactionHash: res.transactionHash
                });
            } catch { }

            setApprovePending(false);

            checkAllowance();
        }
    };

    const handleTransmute = async () => {
        const srcChainId = Number(form.getValues("srcChain"));
        const destChainId = Number(form.getValues("destChain"));

        const srcNetwork = networks.get(srcChainId);
        const destNetwork = networks.get(destChainId);

        const token = tokens.get(form.getValues("token"));

        if (srcNetwork && destNetwork && token) {
            const srcTokenAddress = token.addresses.get(srcChainId);
            const destTokenAddress = token.addresses.get(destChainId);

            const amount = toUnits(form.getValues("amount").toString(), token.decimals);

            const srcTransmuterAddress = transmuters.get(srcChainId);
            const destTransmuterAddress = transmuters.get(destChainId);
            const ccipRouterAddress = ccipRouters.get(srcChainId);

            if (srcTokenAddress && destTokenAddress && srcTransmuterAddress && destTransmuterAddress && ccipRouterAddress && activeAccount) {
                const ccipContract = getContract({
                    client: client,
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
                const messageValues = [srcTokenAddress, destTokenAddress, amount, activeAccount.address];
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

                const contract = getContract({
                    client: client,
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

                const txn = prepareContractCall({
                    contract: contract,
                    method: "transmute",
                    params: [{
                        srcToken: srcTokenAddress,
                        amount: amount,
                        destToken: destTokenAddress,
                        destChain: destNetwork.ccipSelector,
                        destReceiver: activeAccount.address,
                        feeToken: "0x0000000000000000000000000000000000000000",
                        gasLimit: 500000n
                    }],
                    value: ccipFee
                });

                await sendTransaction({
                    account: activeAccount,
                    transaction: txn
                });
            }
        }
    };

    const SubmitButton = () => {
        if (!checkNetwork()) {
            return (
                <Button
                    type="button"
                    className="w-full text-lg font-semibold"
                    onClick={() => {
                        const srcChainId = Number(form.getValues("srcChain"));
                        const srcNetwork = networks.get(srcChainId);

                        if (srcNetwork && activeWalletChain?.id !== srcNetwork.chain.id) {
                            switchChain(srcNetwork.chain);
                        }
                    }}
                >
                    Switch network
                </Button>
            );
        }

        if (hasAllowance) {
            return (
                <Button
                    type="button"
                    className="w-full text-lg font-semibold"
                    onClick={form.handleSubmit(handleTransmute)}
                >
                    Transmute
                </Button>
            );
        }

        return (
            <Button
                type="button"
                className="w-full space-x-2"
                onClick={handleApprove}
            >
                <div
                    hidden={!approvePending}
                >
                    <svg aria-hidden="true" className="w-5 h-5 text-transparent animate-spin fill-black" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                </div>
                <div
                    className="text-lg font-semibold"
                >
                    Approve
                </div>
            </Button>
        );
    };

    return (
        <Card
            className="p-6"
        >
            <Form
                {...form}
            >
                <form
                    onChange={() => {
                        checkAllowance();
                    }}
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
                    <FormField
                        control={form.control}
                        name="srcChain"
                        render={({ field }) => (
                            <FormItem>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder="Select"
                                            />
                                        </SelectTrigger>
                                    </FormControl>
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
                            </FormItem>
                        )}
                    />
                    <div
                        className="text-sm text-muted-foreground mt-2"
                    >
                        To
                    </div>
                    <FormField
                        control={form.control}
                        name="destChain"
                        render={({ field }) => (
                            <FormItem>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder="Select"
                                            />
                                        </SelectTrigger>
                                    </FormControl>
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
                            </FormItem>
                        )}
                    />
                    <div
                        className="text-lg mt-8 mb-2"
                    >
                        Token
                    </div>
                    <FormField
                        control={form.control}
                        name="token"
                        render={({ field }) => (
                            <FormItem>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder="Select"
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {[...tokens.entries()].map(([symbol, token], index) => (
                                            <SelectItem
                                                key={index}
                                                value={symbol}
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
                                                        {symbol}
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <Card
                        className="flex flex-row items-center mt-2 mb-8"
                    >
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem
                                    className="w-full"
                                >
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Amount"
                                            className="bg-transparent border-0 focus-visible:ring-offset-0 focus-visible:ring-0 overflow-ellipsis"
                                            onChange={(e) => { form.setValue("amount", Number(e.currentTarget.value)) }}
                                            value={field.value}
                                            min={0}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="text-xs px-2 h-6 rounded-full mr-2"
                        >
                            MAX
                        </Button>
                    </Card>
                    <SubmitButton />
                </form>
            </Form>
        </Card>
    );
}