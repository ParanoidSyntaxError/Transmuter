"use client";

import { ApproveSpending, CheckNetwork, SufficientAllowance, thirdwebClient } from "@/lib/crypto";
import { useEffect, useState } from "react";
import { Chain, PreparedTransaction, sendTransaction, waitForReceipt } from "thirdweb";
import { useActiveAccount, useActiveWalletChain, useSwitchActiveWalletChain } from "thirdweb/react";
import { Button } from "./ui/button";
import Spinner from "./spinner";
import { Abi } from "viem";

interface TransactionButtonProps {
    requiredAllowance?: number;
    tokenAddress?: string;
    chain?: Chain;
    transaction?: PreparedTransaction<Abi>;
    label: string;
}

export default function TransactionButton({
    requiredAllowance,
    tokenAddress,
    chain,
    transaction,
    label,
}: TransactionButtonProps) {
    const activeAccount = useActiveAccount();
    const activeWalletChain = useActiveWalletChain();
    const switchChain = useSwitchActiveWalletChain();

    const [sufficientAllowance, setSufficientAllowance] = useState<boolean>(false);
    const [approvalPending, setApprovalPending] = useState<boolean>(false);
    const [transactionPending, setTransactionPending] = useState<boolean>(false);

    useEffect(() => {
        const checkAllowance = async () => {
            if (requiredAllowance && requiredAllowance > 0) {
                setSufficientAllowance(await SufficientAllowance(activeAccount, chain, tokenAddress, requiredAllowance));
            }
        };

        checkAllowance().catch(error => console.log(error));
    }, [requiredAllowance, tokenAddress, chain]);

    const handleApprove = async () => {
        if (requiredAllowance && requiredAllowance > 0) {
            setApprovalPending(true);

            await ApproveSpending(
                activeAccount,
                chain,
                tokenAddress,
                requiredAllowance
            );

            setApprovalPending(false);

            setSufficientAllowance(
                await SufficientAllowance(activeAccount, chain, tokenAddress, requiredAllowance)
            );
        }
    };

    const handleTransaction = async () => {
        if (activeAccount && chain && transaction) {
            setTransactionPending(true);

            try {
                const txRecipt = await sendTransaction({
                    account: activeAccount,
                    transaction: transaction
                });

                await waitForReceipt({
                    client: thirdwebClient,
                    chain: chain,
                    transactionHash: txRecipt.transactionHash
                });
            } catch { }

            setTransactionPending(false);
        }
    };

    if (chain && !CheckNetwork(activeWalletChain, chain.id)) {
        return (
            <Button
                type="button"
                className="w-full"
                onClick={() => { switchChain(chain) }}
            >
                <div
                    className="text-lg font-semibold"
                >
                    Switch network
                </div>
            </Button>
        );
    }

    if (!sufficientAllowance) {
        return (
            <Button
                type="button"
                className="w-full space-x-2"
                onClick={handleApprove}
            >
                <Spinner
                    hidden={!approvalPending}
                />
                <div
                    className="text-lg font-semibold"
                >
                    Approve
                </div>
            </Button>
        );
    }

    return (
        <Button
            type="button"
            className="w-full space-x-2"
            onClick={handleTransaction}
        >
            <Spinner
                hidden={!transactionPending}
            />
            <div
                className="text-lg font-semibold"
            >
                {label}
            </div>
        </Button>
    );
}