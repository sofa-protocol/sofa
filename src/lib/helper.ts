import axios from 'axios'
import { Plan } from './types'

export const getCurrTime = async (): Promise<Date> => {
    let apiDate = await axios.get('https://worldtimeapi.org/api/timezone/Etc/UTC')
        .then((res) => {
            return new Date(res.data.datetime)
        })
        .catch((err) => {
            return new Date()
        })
    return apiDate
}

export const getPlanDuration = (plan: Plan): number => {
    switch (plan) {
        case "4 Seater":
            return 56
        case "6 Seater":
            return 28
        case "8 Seater":
            return 28
        default:
            return 0
    }
}

export function extractNumber(input: string): number {
    const regex = /vault_(\d+)/;
    const match = input.match(regex);
    if (!match) return 0;
    return parseInt(match[1]);
}

export const shortWalletAddress = (address: string) => {
    if (!address) return ""
    return address.slice(0, 5) + "..." + address.slice(-4,)
}