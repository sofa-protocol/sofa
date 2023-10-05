import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { plans } from "@/lib/const"
import { PlanDetails } from "@/lib/types"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Button } from "../ui/button"
import axios from "axios"
import { useToast } from "../ui/use-toast"

export default function CreateVault() {

    const [date, setDate] = useState<Date>()
    const [plan, setPlan] = useState<PlanDetails>(plans[0]);
    const [size, setSize] = useState<number>(0);
    const [processing, setProcessing] = useState<boolean>(false)
    const { toast } = useToast()

    const createVault = async () => {
        setProcessing(true)
        if (date == undefined || !plan || size == 0) {
            toast({
                title: "Please fill all the fields",
                description: "Please fill all the fields",
            })
            return
        }
        await axios.post("/api/saveInfo", {
            option: 2,
            duration: plan.duration,
            size,
            name: plan.name,
            startDate: date.getTime(),
            endDate: date.getTime() + plan.duration * 24 * 60 * 60 * 1000
        })
            .then(res => {
                if (res.data.success == true) {
                    toast({
                        title: "Vault Created",
                        description: "Vault has been created successfully",
                    })
                } else {
                    toast({
                        title: "Something went wrong",
                        description: "Please try again",
                    })
                }
            })
            .catch(err => console.log(err))
            .finally(() => setProcessing(false))
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    Create Vault
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Vault</DialogTitle>
                </DialogHeader>
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
                <Label>Size</Label>
                <Input type="number" onChange={(e) => setSize(Number(e.target.value))} />
                <Label>Start Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                " justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <DialogFooter>
                    <Button onClick={createVault}>
                        {
                            processing ? <Loader2 className="animate-spin w-4 h-4" /> : "Create"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}