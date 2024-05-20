import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-no-tick";
import Image from "next/image";

const networks = [
    {
        name: "Ethereum Sepolia",
        icon: "/crypto/networks/Eth.svg"
    },
    {
        name: "Base Sepolia",
        icon: "/crypto/networks/Base.svg"
    }
];

const tokens = [
    {
        symbol: "LNIK",
        icon: "/crypto/tokens/Link.svg"
    },
    {
        symbol: "USDC",
        icon: "/crypto/tokens/Usdc.svg"
    }
];

export default function TransmuteCard() {
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
            >
                <SelectTrigger
                    className="mb-4"
                >
                    <SelectValue
                        placeholder="Select"
                    />
                </SelectTrigger>
                <SelectContent>
                    {networks.map((network, index) => (
                        <SelectItem
                            key={index}
                            value={network.name}
                        >
                            <div
                                className="flex flex-row items-center space-x-2"
                            >
                                <Image
                                    src={network.icon}
                                    alt=""
                                    width={14}
                                    height={14}
                                />
                                <div>
                                    {network.name}
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div
                className="text-sm text-muted-foreground"
            >
                To
            </div>
            <Select>
                <SelectTrigger>
                    <SelectValue
                        placeholder="Select"
                    />
                </SelectTrigger>
                <SelectContent>
                    {networks.map((network, index) => (
                        <SelectItem
                            key={index}
                            value={network.name}
                        >
                            <div
                                className="flex flex-row items-center space-x-2"
                            >
                                <Image
                                    src={network.icon}
                                    alt=""
                                    width={14}
                                    height={14}
                                />
                                <div>
                                    {network.name}
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div
                className="text-lg mt-8 mb-2"
            >
                Token
            </div>
            <Select>
                <SelectTrigger
                    className="mb-4"
                >
                    <SelectValue
                        placeholder="Select"
                    />
                </SelectTrigger>
                <SelectContent
                    className="w-fit"
                >
                    {tokens.map((token, index) => (
                        <SelectItem
                            key={index}
                            value={token.symbol}
                        >
                            <div
                                className="flex flex-row items-center space-x-2"
                            >
                                <Image
                                    src={token.icon}
                                    alt=""
                                    width={14}
                                    height={14}
                                />
                                <div>
                                    {token.symbol}
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Card
                className="flex flex-row items-center mb-12"
            >
                <Input
                    placeholder="Amount"
                    className="bg-transparent border-0 focus-visible:ring-offset-0 focus-visible:ring-0 overflow-ellipsis"
                />
                <Button
                    variant="outline"
                    className="text-xs px-2 h-6 rounded-full mr-2"
                >
                    MAX
                </Button>
            </Card>
            <Button
                className="w-full text-lg font-semibold"
            >
                Transmute
            </Button>
        </Card>
    );
}