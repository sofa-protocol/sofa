import { use, useState } from "react";
import { Input } from "../ui/input";
import { PlanDetails, UserDB, Vault } from "@/lib/types";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { sendSol } from "@/lib/transactions";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { useUserDetailsUpdate } from "@/context/user-context";
import Image from "next/image";
import SolanaLogo from '../../../public/assets/solana.svg'
import { plans } from "@/lib/const";
import axios from "axios";
import { getPlanDuration } from "@/lib/helper";

type NewUserProps = {
    vaultAvailable: boolean
    vaultDetails: Vault | null
}

export default function NewUser(props: NewUserProps) {

    const [deposit, setDeposit] = useState(0);
    const [plan, setPlan] = useState<PlanDetails>(plans[0]);
    const [processing, setProcessing] = useState(false);
    const wallet = useWallet()
    const { toast } = useToast()
    const updateUserData = useUserDetailsUpdate()

    let vaultBarWidth = 0
    if (props.vaultDetails) {
        vaultBarWidth = Math.floor(((props.vaultDetails?.currVol) / (props.vaultDetails?.maxVol)) * 100)
    }


    const handleDeposit = async () => {
        setProcessing(true)

        if (!(deposit > 0)) {
            toast({
                title: "Please enter a valid amount",
            })
            setProcessing(false)
            return
        }

        // Check if vault exists
        if (props.vaultDetails == null) {
            toast({
                title: "No Vaults Open",
            })
            return
        }
        // Check is vault will be full
        if (props.vaultDetails.currVol + deposit > props.vaultDetails.maxVol) {
            toast({
                title: "Please enter a lower amount",
            })
            setProcessing(false)
            return
        }
        try {
            let res = await sendSol(deposit, wallet)
            if (res) {
                let newUser: UserDB = {
                    address: wallet.publicKey?.toBase58() as string,
                    autoDeposit: true,
                    depositedSol: 0,
                    savingsAcc: deposit * 0.98,
                    currPlan: plan.name,
                    profitEarned: 0,
                    depositedVaults: [{
                        amount: deposit * 0.98,
                        vaultId: props.vaultDetails.id,
                        profitEarned: 0,
                        endDate: props.vaultDetails.endDate,
                        ended: false
                    }]
                }
                await axios.post("/api/saveInfo", { option: 0, newUser, userAddress: wallet.publicKey?.toBase58(), vaultDetails: props.vaultDetails })
                    .then(async (res) => {
                        if (res.data.status) {
                            toast({
                                title: `${(deposit * 0.98).toFixed(3)} SOL deposited successfully`,
                            })
                            await axios.post("/api/getInfo", { address: wallet.publicKey?.toBase58(), option: 1 })
                                .then((res) => {
                                    updateUserData(res.data.userDashboardData)
                                })
                                .catch((err) => {
                                    console.log(err)
                                })
                        } else {
                            toast({
                                title: "Something went wrong",
                                description: "Please try again",
                            })
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                        toast({
                            title: "Something went wrong",
                            description: "Please try again",
                        })
                    })

            }
        } catch (err) {
            console.log(err)
            toast({
                title: "Something went wrong",
                description: "Please try again",
            })
        }
        setProcessing(false)
    }


    return (
        <div className="w-[90%] sm:max-w-[425px]">
            <div className=" sm:max-w-[425px] border rounded-lg p-10">

                <Image src={SolanaLogo} alt="SOL" className="my-6 w-[80px]" />

                <div className="flex items-center gap-3 text-2xl font-semibold leading-none tracking-tight">
                    {plan.name}
                    <Badge variant={"secondary"} className="rounded-md">{getPlanDuration(plan.name)} Days</Badge>
                </div>



                <div className="flex justify-between mt-2">
                    <div>
                        <p className="">Est. Yield</p>
                        <p className="text-xl">{plan.apy}%</p>
                    </div>
                    <div className="text-right">
                        <p className="">Vault Size</p>
                        <p className="text-xl">{props.vaultDetails?.maxVol} $SOL</p>
                    </div>
                </div>


                {
                    // props.vaultAvailable ?
                    <div>
                        <div className="mt-4">
                            <p>Vault Current Volume: {props.vaultDetails?.currVol.toFixed(3)} / {props.vaultDetails?.maxVol} SOL</p>
                        </div>
                        <div className="w-full h-[5px] mt-1.5">
                            <div className={` h-[5px] rounded-full gradient-bg-mix bg-red`} style={{ width: `${vaultBarWidth}%` }} />
                        </div>
                        <div className="flex flex-col items-center">
                            <Input
                                type="number"
                                placeholder="Amount in SOL" onChange={(e) => setDeposit(Number(e.target.value))}
                                className="w-full mt-6"
                            />
                            <Select onValueChange={(val) => setPlan(plans.filter((item) => item.name == val)[0])}>
                                <SelectTrigger className="w-full my-4">
                                    <SelectValue placeholder="4 Seater" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="4 Seater">4 Seater</SelectItem>
                                        <SelectItem disabled value="6 Seater" className="upcoming-plan">
                                            <p>6 Seater</p>
                                            <Badge className="scale-75"> Coming Soon</Badge>
                                        </SelectItem>
                                        <SelectItem disabled value="8 Seater" className="upcoming-plan">
                                            <p>8 Seater</p>
                                            <Badge className="text-xs scale-75" > Coming Soon</Badge>
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end items-center mt-6">
                            <Button onClick={handleDeposit}>
                                {
                                    processing ?
                                        <Loader2 className=" h-4 w-4 animate-spin" />
                                        :
                                        "Deposit"
                                }
                            </Button>
                        </div>
                    </div>
                    // :
                    // <p className="my-6 text-center font-semibold">
                    //     No vaults open at the moment. <br /> Please check back later.
                    // </p>
                }
            </div>
        </div>
    )
}