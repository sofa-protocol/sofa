import { Button } from "@/components/ui/button"
import { createSharkyClient, SHARKY_PROGRAM_ID } from '@sharkyfi/client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { sendSol } from "@/lib/transactions";
import { Loader2, Plus } from "lucide-react"
import { useState } from "react";
import { useToast } from "../ui/use-toast";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "../ui/badge";
import { Plan, Vault } from "@/lib/types";
import { Input } from "../ui/input";
import { useUserDetails, useUserDetailsUpdate } from "@/context/user-context";
import axios from "axios";
import { INTEREST } from "@/lib/const";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

type DashboardHeaderProps = {
    autoDeployment: boolean
    depositedSol: number
    vaultAvailable: boolean
    vaultDetails: Vault | null
}

export default function DashboardHeader(props: DashboardHeaderProps) {

    const [deposit, setDeposit] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [withdrawProcessing, setWithdrawProcessing] = useState(false);
    const [plan, setPlan] = useState<Plan>("4 Seater");
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    const { toast } = useToast()
    const wallet = useWallet()
    const updateUserData = useUserDetailsUpdate()
    const userDetails = useUserDetails()


    const handleDeposit = async () => {
        setProcessing(true);
        try {
            if (props.vaultDetails == undefined) return
            if (props.vaultDetails?.currVol + deposit > props.vaultDetails?.maxVol) {
                toast({
                    title: "Please try  with a lower amount",
                })
                setProcessing(false)
                return
            }
            let res = await sendSol(deposit, wallet)
            if (res) {
                await axios.post('/api/saveInfo', {
                    option: 1,
                    vaultDetails: props.vaultDetails,
                    amount: deposit,
                    userAddress: wallet.publicKey?.toBase58(),
                })
                    .then((result) => {
                        if (result.data.status) {
                            console.log("New data:", result.data.updatedData)
                            updateUserData(result.data.updatedData)
                            toast({
                                title: `${deposit} SOL deposited successfully`,
                            })
                        }
                    })
                    .catch((err) => {

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

    const handleWithdraw = async () => {
        setWithdrawProcessing(true);
        try {
            if (userDetails == undefined) return
            if (withdrawAmount > userDetails.savingsAcc) {
                toast({
                    title: "Oops! You don't have enough balance to withdraw",
                })
                setWithdrawProcessing(false)
                return
            }
            await axios.post('/api/transactions', { option: 1, amount: withdrawAmount, address: wallet.publicKey?.toBase58() })
                .then((res) => {
                    console.log(res.data)
                    toast({
                        title: `${withdrawAmount} SOL withdrawn successfully`,
                        description: "Please check your wallet for the transaction"
                    })
                })
                .catch((err) => {
                    console.log(err)

                })
        } catch (err) {
            console.log(err)
            toast({
                title: "Something went wrong",
                description: "Please try again",
            })
        }
        setWithdrawProcessing(false)
    }


    // const changeAutoredeployment = async (value: boolean) => {
    //     const docRef = doc(db, "users", wallet.publicKey?.toBase58() as string);
    //     if (value) {
    //         await updateDoc(docRef, {
    //             autoDeposit: true
    //         });
    //         toast({
    //             title: `Auto Reployment Enabled`,
    //         })
    //     } else {
    //         await updateDoc(docRef, {
    //             autoDeposit: false
    //         });
    //         toast({
    //             title: `Auto Reployment Disabled`,
    //         })
    //     }
    // }

    const anchorWallet = useAnchorWallet()
    // const { connection } = useConnection()
    function sortArrayOfObjectsByName(array: any) {
        return array.sort((a: any, b: any) => {
            const nameA = a.collectionName.toUpperCase(); // Convert to uppercase to ensure case-insensitive sorting
            const nameB = b.collectionName.toUpperCase();

            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
    }

    const fetchOrderBooks = async () => {
        if (anchorWallet === null || anchorWallet === undefined) return
        // const connection = new Connection(process.env.RPC_ENDPOINT as string)
        const connection = new Connection("https://rpc.helius.xyz/?api-key=73ffd464-26a0-43c7-9d1a-3372360b6a8a")
        const provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())
        const sharkyClient = createSharkyClient(
            provider,
            new PublicKey(SHARKY_PROGRAM_ID),
            'mainnet'
        )
        const { program } = sharkyClient

        console.log({ sharkyClient })
        const DEGODS_NFT_LIST_PUBKEY = "DpkLdzn6vQASVD1J5diUFCz2kVJfxkp9K5f5JEM1csz"

        const allOrderBooks = await sharkyClient.fetchAllOrderBooks({
            program,
        })
        console.log({ allOrderBooks })
        await Promise.all(
            allOrderBooks.map((orderBook) => {
                if (orderBook.orderBookType.nftList?.listAccount.toBase58() == "EBm3znbydgWFzNRhkyKLoio7DYjSSnfnTXkD8Ky3P9o5") {
                    console.log("found")
                    console.log({ orderBook })
                }
            })
        )
        console.log("finished")
        return
        const allNftlist = await sharkyClient.fetchAllNftLists
            ({
                program,
            })
        console.log({ allNftlist })
        let sorted = sortArrayOfObjectsByName(allNftlist)
        sorted.map((nftlist: any) => {
            console.log(`${nftlist.collectionName}: ${nftlist.pubKey.toBase58()}`)
        })
        console.log("finished")
        return
        let orderBook
        if (orderBook === null || orderBook === undefined) {
            console.log("orderbook is null")
            return
        }
        const { offeredLoans, sig } = await orderBook.offerLoan({
            program: sharkyClient.program,
            principalLamports: 0.0001 * LAMPORTS_PER_SOL,
            onTransactionUpdate: console.dir,
        })

        console.log(
            `Loan offered! Its pubkey is: ${offeredLoans[0].pubKey.toString()}`
        )

        // await createProvider(wallet)
    }

    return (
        <div className="flex flex-col justify-between md:flex-row ">
            <h2 className="text-3xl text-left font-bold tracking-tight py-3" onClick={fetchOrderBooks}>
                Living Room
            </h2>

            <div className="flex justify-between items-center gap-4">
                {/* <div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="airplane-mode"
                            defaultChecked={props.autoDeployment}
                        // onCheckedChange={(value) => changeAutoredeployment(value)}
                        />
                        <Label htmlFor="airplane-mode">Auto Redeployment</Label>
                    </div>
                </div> */}

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="flex justify-center items-center gap-2"  >
                            Withdraw
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Withdraw Amount</DialogTitle>
                        </DialogHeader>
                        <p>Available Amount to withdraw: {userDetails?.savingsAcc.toFixed(3)} $SOL</p>
                        {
                            userDetails?.depositedSol && userDetails.depositedSol > 0 ?
                                <p className="text-xs text-gray-400">* Your {userDetails?.depositedSol} is locked and can only be withdraw after {userDetails?.daysLeft} days.</p>
                                : ""
                        }
                        <Input type="number" placeholder="Amount in SOL" onChange={(e) => setWithdrawAmount(Number(e.target.value))} />

                        <DialogFooter>
                            <Button onClick={handleWithdraw}>
                                {
                                    withdrawProcessing ? <Loader2 className=" h-4 w-4 animate-spin" /> : "Withdraw"
                                }
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>


                {
                    props.vaultAvailable ?
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="flex justify-center items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Deposit SOL
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Deposit</DialogTitle>
                                    <DialogDescription>
                                        Enter the amount of SOL you want to deposit
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col ">
                                    <p>Current Vault Status: {props.vaultDetails?.currVol.toFixed(3)} / {props.vaultDetails?.maxVol} $SOL</p>
                                    <div className="flex  items-center gap-4 py-5">
                                        <Input className="w-[90%]" type="number" placeholder="Amount in SOL" onChange={(e) => setDeposit(Number(e.target.value))} />
                                    </div>
                                    <Select onValueChange={(val) => setPlan(val as Plan)}>
                                        <SelectTrigger className="w-[90%] my-4">
                                            <SelectValue placeholder="4 Seater (7 Days)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="4 Seater">4 Seater (7 Days)</SelectItem>
                                                <SelectItem disabled value="6 Seater" className="upcoming-plan">
                                                    <p>6 Seater</p>
                                                    <Badge> Coming Soon</Badge>
                                                </SelectItem>
                                                <SelectItem disabled value="8 Seater" className="upcoming-plan">
                                                    <p>8 Seater</p>
                                                    <Badge> Coming Soon</Badge>
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <DialogFooter>
                                    <Button onClick={handleDeposit}>
                                        {
                                            processing ?
                                                <Loader2 className=" h-4 w-4 animate-spin" />
                                                :
                                                "Deposit"
                                        }
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        :
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" className="cursor-default opacity-60">Deposit SOL</Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>No vaults open at the moment</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                }
            </div>


        </div>
    )
}