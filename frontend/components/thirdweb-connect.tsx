"use client"

import { createThirdwebClient } from "thirdweb";
import { avalancheFuji, baseSepolia, polygonAmoy, sepolia } from "thirdweb/chains";
import { ConnectButton } from "thirdweb/react";
import {
    createWallet,
    walletConnect,
    inAppWallet,
} from "thirdweb/wallets";

const client = createThirdwebClient({
    clientId: "121c4134033137bc824d6a5ee780240a",
});

const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    walletConnect(),
    inAppWallet({
        auth: {
            options: [
                "email",
                "google",
                "apple",
                "facebook",
            ],
        },
    }),
    createWallet("app.phantom"),
];

export default function ThirdwebConnect() {
    return (
        <ConnectButton
            client={client}
            wallets={wallets}
            theme="dark"
            connectButton={{
                label: "connect",
                style: {
                    fontWeight: "bold",
                    backgroundColor: "white"
                }
            }}
            connectModal={{
                size: "compact",
                title: "transmuter",
                titleIcon: "/PortalGreen.png",
                showThirdwebBranding: false,
            }}
            chains={[
                sepolia,
                baseSepolia,
                polygonAmoy,
                avalancheFuji
            ]}
        />
    );
}