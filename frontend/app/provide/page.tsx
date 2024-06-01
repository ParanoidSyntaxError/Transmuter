import AppBar from "@/components/app-bar";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepositCard from "@/components/deposit-card";
import DepositList from "@/components/deposit-list";

export default function ProvidePage() {
    return (
        <div
            className="w-full px-4 pb-4"
        >
            <div
                className="w-full"
            >
                <AppBar />
            </div>
            <div
                className="flex flex-row items-center w-fit mx-auto mt-12 mb-4"
            >
                <div
                    className="text-4xl font-semibold"
                >
                    provide
                </div>
                <Image
                    src="/GermYellow.png"
                    alt=""
                    width={64}
                    height={64}
                />
            </div>
            <div
                className="max-w-96 w-full mx-auto"
            >
                <Tabs
                    defaultValue="provide"
                    className="w-full"
                >
                    <TabsList
                        className="flex w-fit mx-auto"
                    >
                        <TabsTrigger
                            value="provide"
                        >
                            Deposit
                        </TabsTrigger>
                        <TabsTrigger
                            value="withdraw"
                        >
                            Withdraw
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                        >
                            History
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="provide"
                    >
                        <DepositCard />
                    </TabsContent>
                    <TabsContent
                        value="withdraw"
                    >
                        <div
                            className="mt-4"
                        >
                            <DepositList />
                        </div>
                    </TabsContent>
                    <TabsContent
                        value="history"
                    >
                        <div
                            className="text-center text-xl font-semibold mt-20"
                        >
                            Coming soon
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}