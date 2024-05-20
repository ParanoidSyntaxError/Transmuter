import AppBar from "@/components/app-bar";
import Image from "next/image";

export default function ProvidePage() {
    return (
        <div
            className="w-full p-4"
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
        </div>
    );
}