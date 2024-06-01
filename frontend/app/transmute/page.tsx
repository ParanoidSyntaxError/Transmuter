import AppBar from "@/components/app-bar";
import Image from "next/image";
import TransmuteCard from "@/components/transmute-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TransmutePage() {
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
                    transmute
                </div>
                <Image
                    src="/PortalGreen.png"
                    alt=""
                    width={64}
                    height={64}
                />
            </div>
            <div
                className="max-w-96 w-full mx-auto"
            >
                <Tabs
                    defaultValue="transmute"
                    className="w-full"
                >
                    <TabsList
                        className="flex w-fit mx-auto"
                    >
                        <TabsTrigger
                            value="transmute"
                        >
                            Transmute
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                        >
                            History
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="transmute"
                    >
                        <TransmuteCard />
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