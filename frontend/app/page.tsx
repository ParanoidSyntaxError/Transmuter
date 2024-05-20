import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
	return (
		<div
			className="w-full p-4 space-y-8"
		>
			<div
				className="flex justify-end w-full"
			>
				<Link
					href="/transmute"
				>
					<Button
						variant="outline"
						className="flex flex-row gap-x-2 h-fit border-[#FF00FF]"
					>
						<div
							className="md:w-12 md:h-12 w-8 h-8 relative"
						>
							<Image
								src="/StarsPink.png"
								alt=""
								fill
							/>
						</div>
						<div
							className="text-sm md:text-lg"
						>
							Launch App
						</div>
					</Button>
				</Link>
			</div>
			<div
				className="flex flex-row items-end w-fit mx-auto"
			>
				<div
					className="space-y-2"
				>
					<div
						className="shrink text-center md:text-7xl text-5xl font-bold"
					>
						transmuter
					</div>
					<div
						className="md:text-lg text-xs text-[#00FF00]"
					>
						Decentralized CCIP liquidity pools
					</div>
				</div>
				<div
					className="md:w-32 md:h-32 w-20 h-20 relative"
				>
					<Image
						src="/PortalGreen.png"
						alt=""
						fill
					/>
				</div>
			</div>
		</div>
	);
}
