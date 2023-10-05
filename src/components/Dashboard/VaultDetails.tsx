import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useUserDetails } from "@/context/user-context"
import { CircleDollarSign, GanttChart, Hourglass, PiggyBank } from "lucide-react"
import { useEffect } from "react"


export default function VaultDetails() {

    const userData = useUserDetails()


    const cardData = [
        {
            title: "Plan",
            value: userData?.currPlan ?? "No Plan",
            icon: <GanttChart className="h-4 w-4 text-muted-foreground" />
        },
        {
            title: "Days Left",
            value: userData?.daysLeft ? userData.daysLeft + " Days" : "NA",
            icon: <Hourglass className="h-4 w-4 text-muted-foreground" />
        },
        {
            title: "Balance",
            value: userData?.savingsAcc || userData?.depositedSol ? (userData.depositedSol + userData.savingsAcc).toFixed(3) + " $SOL" : "NA",
            icon: <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        },
        {
            title: "Earnings",
            value: userData?.profitEarned != null ? userData.profitEarned.toFixed(3) + " $SOL" : "NA",
            icon: <PiggyBank className="h-4 w-4 text-muted-foreground" />
        }
    ]

    return (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {
                cardData.map((item, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {item.title}
                            </CardTitle>
                            {item.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                            {/* <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p> */}
                        </CardContent>
                    </Card>
                ))
            }
        </div>
    )
}