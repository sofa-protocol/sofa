import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Admin } from "@/lib/types"
import axios from "axios"
import { CircleDollarSign, GanttChart, Hourglass, PiggyBank } from "lucide-react"
import { useEffect, useState } from "react"



export default function StatsDetails() {


    const [activeUsers, setActiveUsers] = useState(0)
    const [adminData, setAdminData] = useState<Admin>({} as Admin)

    const cardData = [
        {
            title: "Active Users",
            value: adminData.activeUsers ?? 0,
            icon: <GanttChart className="h-4 w-4 text-muted-foreground" />
        },
        {
            title: "SOL Deposited",
            value: `${adminData.totalSolDeposited ? adminData.totalSolDeposited.toFixed(3) : "0"} $SOL`,
            icon: <Hourglass className="h-4 w-4 text-muted-foreground" />
        },
        {
            title: "Loans Completed",
            value: adminData.loansCompleted ?? 0,
            icon: <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        },
        {
            title: "Loans Live",
            value: adminData.loansLive ?? 0,
            icon: <PiggyBank className="h-4 w-4 text-muted-foreground" />
        },
        {
            title: "Interest Earned",
            value: `${adminData.interestEarned ?? 0} $SOL`,
            icon: <PiggyBank className="h-4 w-4 text-muted-foreground" />
        },
        {
            title: "Default Rate",
            value: `${adminData.defaultRate ?? 0} %`,
            icon: <PiggyBank className="h-4 w-4 text-muted-foreground" />
        },
        {
            title: "TVL",
            value: `${adminData.tvl ?? 0} $SOL`,
            icon: <PiggyBank className="h-4 w-4 text-muted-foreground" />
        },
        {
            title: "Average LTV",
            value: `${adminData.avgLtv ?? 0} %`,
            icon: <PiggyBank className="h-4 w-4 text-muted-foreground" />
        },
        {
            title: "Revenue",
            value: `${adminData.revenue ?? 0} $SOL`,
            icon: <PiggyBank className="h-4 w-4 text-muted-foreground" />
        },
    ]

    const fetchAdminData = async () => {
        // let adminData = await getAdminDetails()
        // console.log({ adminData })
        // setAdminData(adminData)
        await axios.post("/api/getInfo", { option: 2 })
            .then((res) => {
                console.log(res)
                setAdminData({
                    ...adminData,
                    totalSolDeposited: res.data.adminDashboardData.totalSolDeposited,
                    activeUsers: res.data.adminDashboardData.activeUsers,
                    revenue: res.data.adminDashboardData.revenue.toFixed(3),
                    tvl: res.data.adminDashboardData.tvl
                })
            })
            .catch((err) => console.log(err))
    }

    useEffect(() => {
        fetchAdminData()
    }, [])

    return (
        <div className="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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