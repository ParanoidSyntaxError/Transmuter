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
			<div
				className="w-fit space-y-8 mx-auto pt-24"
			>
				<div
					className="flex flex-row space-x-4"
				>
					<div
						className="md:w-48 md:h-48 w-32 h-32 relative"
					>
						<Image
							src="/GermYellow.png"
							alt=""
							fill
						/>
					</div>
					<div
						className="md:mt-8 mt-4 space-y-2"
					>
						<div
							className="md:text-2xl text-xl"
						>
							Cross-Chain Liquidity
						</div>
						<div
							className="md:text-base text-sm"
						>
							Bridge any ERC20 token between<br />CCIP supported networks
						</div>
					</div>
				</div>
				<div
					className="flex flex-row space-x-4"
				>
					<div
						className="md:w-48 md:h-48 w-32 h-32 relative"
					>
						<Image
							src="/PortalGreen.png"
							alt=""
							fill
						/>
					</div>
					<div
						className="md:mt-8 mt-4 space-y-2"
					>
						<div
							className="md:text-2xl text-xl"
						>
							Chainlink CCIP
						</div>
						<div
							className="md:text-base text-sm"
						>
							Secured by Chainlink's CCIP<br />for unmatched reliability
						</div>
					</div>
				</div>
				<div
					className="flex flex-row space-x-4"
				>
					<div
						className="md:w-48 md:h-48 w-32 h-32 relative"
					>
						<Image
							src="/RatioCyan.png"
							alt=""
							fill
						/>
					</div>
					<div
						className="md:mt-8 mt-4 space-y-2"
					>
						<div
							className="md:text-2xl text-xl"
						>
							Capital Efficiency
						</div>
						<div
							className="md:text-base text-sm"
						>
							Liquidity providers are incentivized<br />to meet supply and demand
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
