
export type Admin = {
    activeUsers: number
    totalSolDeposited: number
    loansCompleted: number
    loansLive: number
    interestEarned: number
    defaultRate: number
    tvl: number
    avgLtv: number
    revenue: number
}

export type UserDB = {
    address: string
    currPlan: Plan | null
    depositedSol: number
    profitEarned: number
    autoDeposit: boolean
    savingsAcc: number
    depositedVaults: DepositedVault[]
}

export type UserDashboard = {
    currPlan: Plan | null
    depositedSol: number
    savingsAcc: number
    profitEarned: number
    autoDeposit: boolean
    depositedVaults: DepositedVault[]
    daysLeft: number | null
}

export type DepositedVault = {
    vaultId: number
    amount: number
    profitEarned: number
    endDate: number
    ended: boolean
}

export type LendSol = {
    orderBookPubkey: string
    duration: number
    amount: number
}

export type DistributeSol = {
    addr: string,
    amount: number
}

export type Plan = "4 Seater" | "6 Seater" | "8 Seater"

export type PlanDetails = {
    name: Plan
    duration: number
    size: number
    apy: number
}

export type Vault = {
    name: Plan
    duration: number
    startDate: number
    endDate: number
    maxVol: number
    currVol: number
    id: number
    closed: boolean
    totalProfit: number
    deposits: {
        address: string
        amount: number
        profitEarned: number
    }[]
}

export type Orderbook = {
    name: string
    pubkey: string
}