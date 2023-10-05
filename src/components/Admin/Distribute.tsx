import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { Input } from "../ui/input"
import axios from "axios"
import { Vault } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { useToast } from "../ui/use-toast"
export function Distribute() {

    const [selectedVault, setSelectedVault] = useState("")
    const [endedVaults, setEndedVaults] = useState<Vault[]>([])
    const [interest, setInterest] = useState(0)
    const [processing, setProcessing] = useState(false)
    const [password, setPassword] = useState("")
    const { toast } = useToast()

    const fetchAllEndedVaults = async () => {
        await axios.post(`/api/getInfo`, { option: 3 })
            .then((res) => {
                console.log(res.data)
                console.log("Ended vaults fetched")
                setEndedVaults(res.data.endedVaults)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const handleDistribute = async () => {
        setProcessing(true)
        let vault: Vault = JSON.parse(selectedVault)

        await axios.post(`/api/transactions`, { option: 0, interest, depositedSol: vault.currVol, vaultId: vault.id, password })
            .then((res) => {
                console.log(res.data)
                console.log("Distributed")
                toast({
                    title: "Distribute Success",
                })
                fetchAllEndedVaults()
            })
            .catch((err) => {
                console.log(err)
            }).finally(() => {
                setProcessing(false)
            })
    }

    useEffect(() => {
        fetchAllEndedVaults()
    }, [])

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Distribute Profits</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Distribute</DialogTitle>
                </DialogHeader>
                {
                    endedVaults.length > 0 ?
                        <div className="flex flex-col gap-3">

                            <Select onValueChange={(val) => (setSelectedVault(val))}>
                                <SelectTrigger >
                                    <SelectValue placeholder="Select Vault" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {
                                            endedVaults.map((item, index) => (
                                                <SelectItem value={JSON.stringify(item)} key={index}>
                                                    vault {item.id}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <Input placeholder="Enter Profit in SOL" type="number" onChange={(e) => setInterest(Number(e.target.value))} />
                            <Input type="password" placeholder="Enter password" onChange={(e) => setPassword(e.target.value)} />

                            <DialogFooter>
                                <Button onClick={handleDistribute}>
                                    {
                                        processing ? <Loader2 className="animate-spin w-4 h-4" /> : "Distribute SOL"
                                    }

                                </Button>
                            </DialogFooter>
                        </div>
                        :
                        <p className="text-center">
                            No vaults to distribute
                        </p>
                }
            </DialogContent>
        </Dialog >
    )
}
