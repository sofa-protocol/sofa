"use client"
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";


export default function LoginPage() {

    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const wallet = useWallet()

    const checkIfUserLoggedIn = async () => {
        console.log("Chekking user...")
        //@ts-ignore
        if (session?.publicKey) {
            console.log("User logged in")
            router.push("/")
        } else {
            console.log("User not logged in")
            setLoading(false)
        }
    }

    useEffect(() => {
        checkIfUserLoggedIn()
    }, [session])

    return (
        <div className="h-[calc(100vh)] md:h-[calc(100vh-200px)] flex justify-center items-center">
            <div>
                {
                    //@ts-ignore
                    loading ?
                        <Loader2 className="animate-spin w-4 h-4" />
                        :
                        <div className="flex flex-col justify-center items-center gap-6 h-[calc(100vh-200px)]">
                            {
                                wallet.connected ?
                                    <h1 className="text-3xl text-center font-extrabold leading-tight tracking-tighter md:text-4xl">
                                        Please Sign In to Continue
                                    </h1>
                                    :
                                    <h1 className="text-3xl text-center font-extrabold leading-tight tracking-tighter md:text-4xl">
                                        Please Connect Your Wallet <br /> to Continue
                                    </h1>

                            }

                        </div>
                }
            </div>
        </div>
    )
}