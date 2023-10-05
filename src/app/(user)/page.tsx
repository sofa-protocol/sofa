'use client'
import DashboardHeader from "@/components/Dashboard/DashboardHeader"
import NewUser from "@/components/Dashboard/NewUser"
import VaultDetails from "@/components/Dashboard/VaultDetails"
import { useUserDetails, useUserDetailsUpdate } from "@/context/user-context"
import { Vault } from "@/lib/types"
import { useWallet } from "@solana/wallet-adapter-react"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function Dashboard() {

    const wallet = useWallet()
    const userData = useUserDetails()
    const updateUserData = useUserDetailsUpdate()
    const [vaultAvailable, setVaultAvailable] = useState(false)
    const [vaultDetails, setVaultDetails] = useState<Vault | null>(null)

    const checkVaultAvailability = async () => {
        console.log("Checking availability...")
        await axios.post("/api/getInfo", { option: 0 })
            .then((res) => {
                console.log(res.data)
                setVaultAvailable(res.data.result.available)
                if (res.data.result.available) {
                    setVaultDetails(res.data.result.vault)
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const checkUser = async (address: string) => {
        console.log("Checking user...")

        await axios.post("/api/getInfo", { address, option: 1 })
            .then(async (res) => {
                await updateUserData(res.data.userDashboardData)
            })
    }

    useEffect(() => {
        updateUserData(null)
        console.log(wallet.publicKey?.toBase58())
        if (wallet.publicKey) {
            checkUser(wallet.publicKey.toBase58())
            checkVaultAvailability()
        }
        // checkUser("5xSaxa9WFV1Res2Xz8DFzsDevn1BcFWVB68xpygutdyW")
    }, [wallet.publicKey])


    return (
        <div>
            <div className="mx-auto max-w-screen-xl py-8">
                {
                    wallet.connected ?
                        userData ?
                            userData?.currPlan != null ?
                                <div className="px-3">
                                    <DashboardHeader
                                        autoDeployment={userData.autoDeposit}
                                        depositedSol={userData.depositedSol}
                                        vaultAvailable={vaultAvailable}
                                        vaultDetails={vaultDetails}
                                    />
                                    <VaultDetails
                                    />
                                </div>
                                :
                                <div className="flex flex-col justify-center items-center gap-6 h-[calc(100vh-200px)]">
                                    <NewUser
                                        vaultAvailable={vaultAvailable}
                                        vaultDetails={vaultDetails}
                                    />
                                </div>
                            :
                            <div className="flex flex-col justify-center items-center gap-6 h-[calc(100vh-200px)]">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            </div>
                        :
                        <div className="flex flex-col justify-center items-center gap-6 h-[calc(100vh-200px)]">
                            <h1 className="text-3xl text-center font-extrabold leading-tight tracking-tighter md:text-4xl">
                                Please Connect Your Wallet <br /> to Continue.
                            </h1>
                        </div>
                }
            </div>
        </div>
    )
}