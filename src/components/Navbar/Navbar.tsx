'use client'
import Image from "next/image"
import Discord from "../../../public/assets/discord.svg"
import Twitter from "../../../public/assets/twitter.svg"
import { WalletConnectButton, WalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "../ui/button"
import SofaLogo from '../../../public/assets/sofa-logo.png'
import { SigninMessage } from "@/lib/SignMessage"
import { useWallet } from "@solana/wallet-adapter-react"
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react"
import bs58 from "bs58"
import { useEffect } from "react"
import { shortWalletAddress } from "@/lib/helper"
import { LogOut } from "lucide-react"
import axios from "axios"

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {


    const { data: session, status } = useSession();
    const path = usePathname()

    const walletModal = useWalletModal();
    const wallet = useWallet();

    const handleSignIn = async () => {
        try {
            if (!wallet.connected) {
                walletModal.setVisible(true);
            }

            const csrf = await getCsrfToken();
            if (!wallet.publicKey || !csrf || !wallet.signMessage) return;

            const message = new SigninMessage({
                domain: window.location.host,
                publicKey: wallet.publicKey?.toBase58(),
                statement: `Sign this message to sign in to the app.`,
                nonce: csrf,
            });

            const data = new TextEncoder().encode(message.prepare());
            const signature = await wallet.signMessage(data);
            const serializedSignature = bs58.encode(signature);
            console.log({ serializedSignature })

            signIn("credentials", {
                message: JSON.stringify(message),
                signature: serializedSignature,
                callbackUrl: "/"
            })

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="  p-4 font-mono">
            <div className="flex items-center justify-between gap-5 max-w-screen-xl mx-auto">
                <Link href="/" className="cursor-pointer flex items-center gap-2 ">
                    <Image src={SofaLogo} alt="logo" className="w-16 h-fit" />
                    <p className="text-4xl gradient-txt-logo ">
                        SOFA
                    </p>
                </Link>
                <div className="flex gap-4 items-center">
                    {
                        //@ts-ignore
                        session ?
                            <div className="flex items-center gap-4">
                                <Button className="font-inter">
                                    {/* @ts-ignore */}
                                    {shortWalletAddress(session?.publicKey as string)}
                                </Button>
                                <LogOut className="w-5 h-5 cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        signOut();
                                    }}
                                />
                            </div>
                            :
                            <Button className="font-inter" onClick={handleSignIn}>
                                {
                                    wallet.connected ?
                                        "Sign In"
                                        :
                                        "Connect Wallet"
                                }
                            </Button>
                    }

                    {/* <Image src={Discord} alt="sofa" width={25} height={25} className="opacity-70 cursor-pointer hover:opacity-100" /> */}
                    {/* <Image src={Twitter} alt="sofa" width={22} height={22} className="opacity-70 cursor-pointer hover:opacity-100" /> */}
                </div>

            </div>

        </div>

    )
}