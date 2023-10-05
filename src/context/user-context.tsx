import { UserDashboard } from '@/lib/types'
import React, { createContext, useContext, useState } from 'react'

type UserContextProviderProps = {
    children: React.ReactNode
}

const UserContext = createContext<UserDashboard | null>(null)
const UserUpdateContext = createContext<(data: UserDashboard | null) => void>({} as (data: UserDashboard | null) => void)


export function useUserDetails() {
    return useContext(UserContext)
}
export function useUserDetailsUpdate() {
    return useContext(UserUpdateContext)
}



export const UserDetailsProvider = ({ children }: UserContextProviderProps) => {


    const [userDetails, setUserDetails] = useState<UserDashboard | null>(null)
    const updateUserDetails = (data: UserDashboard | null) => {
        console.log({ data })
        setUserDetails(data)
        console.log(userDetails?.depositedSol)
    }

    return (
        <UserContext.Provider value={userDetails}>
            <UserUpdateContext.Provider value={updateUserDetails}>
                {children}
            </UserUpdateContext.Provider>
        </UserContext.Provider>
    )
}