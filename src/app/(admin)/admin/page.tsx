'use client'

import StatsDetails from "@/components/Admin/StatsDetails"
import CreateVault from "@/components/Admin/CreateVault"
import { Distribute } from "@/components/Admin/Distribute"
import LockDeposits from "@/components/Admin/LockDeposits"
import OfferLoan from "@/components/Admin/OfferLoan"

export default function AdminDashboard() {


    return (
        <div className="px-3">
            <div className="mx-auto max-w-screen-xl py-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl text-left font-bold tracking-tight py-3">
                        Statistics 🚀
                    </h2>
                    <div className="flex items-center gap-2">
                        <OfferLoan />
                        <LockDeposits />
                        <Distribute />
                        <CreateVault />
                    </div>
                </div>
                <StatsDetails />
            </div>
        </div>
    )
}