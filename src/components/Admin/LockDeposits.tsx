import { useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";

export default function LockDeposits() {

    const [processing, setProcessing] = useState<boolean>(false)
    const { toast } = useToast()

    const handleLockDeposits = async () => {
        setProcessing(true)

        await axios.post("/api/transactions", {
            option: 2,
        })
            .then(res => {
                if (res.data.status == true) {
                    toast({
                        title: "Deposits Locked",
                    })
                } else {
                    console.log(res.data.err)
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
        <Button onClick={handleLockDeposits}>
            {
                processing ? <Loader2 className="animate-spin w-4 h-4" /> : "Lock Deposits"
            }
        </Button>
    )
}