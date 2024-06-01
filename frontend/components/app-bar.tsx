import ThirdwebConnect from "@/components/thirdweb-connect";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

export default function AppBar() {
    return (
        <div
            className="flex flex-row items-center md:justify-between justify-end h-20"
        >
            <Link
                href="/"
                className="md:block hidden w-fit h-fit"
            >
                <Button
                    variant="link"
                    className="px-1 py-0 h-fit text-2xl"
                >
                    transmuter.xyz
                </Button>
            </Link>
            <div
                className="flex flex-row items-center gap-x-4"
            >
                <Link
                    href="/transmute"
                    className="flex flex-row items-center w-fit h-fit"
                >
                    <Button
                        variant="link"
                        className="px-1 py-0 h-fit"
                    >
                        <div
                            className="text-lg"
                        >
                            transmute
                        </div>
                        <Image
                            src="/PortalGreen.png"
                            alt=""
                            width={32}
                            height={32}
                            className="md:block hidden"
                        />
                    </Button>
                </Link>
                <Link
                    href="/provide"
                    className="flex flex-row items-center w-fit h-fit"
                >
                    <Button
                        variant="link"
                        className="px-1 py-0 h-fit"
                    >
                        <div
                            className="text-lg"
                        >
                            provide
                        </div>
                        <Image
                            src="/GermYellow.png"
                            alt=""
                            width={32}
                            height={32}
                            className="md:block hidden"
                        />
                    </Button>
                </Link>
                <div
                    className="ml-4"
                >
                    <ThirdwebConnect />
                </div>
            </div>
        </div>
    );
}