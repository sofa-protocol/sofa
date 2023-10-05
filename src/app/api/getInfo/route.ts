import { authOptions } from "@/lib/const";
import { getCurrTime } from "@/lib/helper";
import { UserDB, UserDashboard, Vault } from "@/lib/types";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    const session = await getServerSession(authOptions);

    console.log("API ", { session })

    if (!session) {
        return NextResponse.json({ err: "User Not Authenticated" })
    }


    const reqBody = await request.json()
    const firebaseConfig = {
        apiKey: process.env.API_KEY,
        authDomain: process.env.AUTH_DOMAIN,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID,
        measurementId: process.env.MEASUREMENT_ID
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);


    // return NextResponse.json({ request })

    try {
        switch (reqBody.option) {
            case 0: // Check any valuts are available to deposit
                try {
                    console.log("Checking vaults availbale")
                    const now = new Date()
                    const querySnapshot = await getDocs(collection(db, "vaults"));
                    let result = { available: false, vault: {} }
                    querySnapshot.forEach((doc) => {
                        if (!doc.data().closed && doc.data().startDate > now.getTime() && doc.data().currVol < doc.data().maxVol) {
                            console.log("Vault available")
                            result = { available: true, vault: doc.data() }
                        }
                    });
                    return NextResponse.json({ result })
                } catch (err) {
                    console.log(err)
                    return NextResponse.json({ available: false, err })
                }
            case 1: // Check if user exists
                try {
                    const { address } = reqBody
                    if (address == process.env.ADMIN_1 || address == process.env.ADMIN_2) {
                        return NextResponse.json({ status: "admin" })
                    }
                    const docRef = doc(db, "users", address);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        let data = docSnap.data() as UserDB
                        console.log({ data })
                        let now = new Date().getTime()
                        let smallestEndDate: number | null = null
                        let daysLeft: number | null = null
                        data.depositedVaults.map((item) => {
                            if (item.profitEarned == 0) {
                                if (smallestEndDate == null) {
                                    smallestEndDate = item.endDate
                                } else {
                                    smallestEndDate = Math.min(smallestEndDate, item.endDate)
                                }
                            }
                        })
                        if (smallestEndDate != null) {
                            daysLeft = Math.floor((smallestEndDate - now) / (1000 * 60 * 60 * 24))
                            if (daysLeft < 0) {
                                daysLeft = 0
                            }
                        }
                        console.log({ smallestEndDate })
                        let userDashboardData: UserDashboard = {
                            currPlan: data.currPlan,
                            depositedSol: data.depositedSol,
                            savingsAcc: data.savingsAcc,
                            profitEarned: data.profitEarned,
                            autoDeposit: data.autoDeposit,
                            depositedVaults: data.depositedVaults,
                            daysLeft
                        }
                        console.log({ userDashboardData })
                        return NextResponse.json({ userDashboardData })
                    } else {
                        return NextResponse.json({ userDashboardData: {} })
                    }

                } catch (err) {
                    console.log(err)
                    return NextResponse.json({ err })

                }
            case 2: // get Admin Dashboard Data
                try {
                    const querySnapshot = await getDocs(collection(db, "users"));
                    let adminDashboardData = {
                        activeUsers: 0,
                        totalSolDeposited: 0,
                        revenue: 0,
                        tvl: 0
                    }
                    querySnapshot.forEach((doc) => {
                        if ((doc.data().savingsAcc + doc.data().depositedSol) > 0) {
                            adminDashboardData.totalSolDeposited += doc.data().savingsAcc + doc.data().depositedSol
                            adminDashboardData.activeUsers++
                        }
                    });
                    const admiRef = doc(db, "admin", "data");
                    const admiSnap = await getDoc(admiRef);
                    if (admiSnap.exists()) {
                        adminDashboardData.revenue = admiSnap.data().revenue
                        adminDashboardData.tvl = admiSnap.data().tvl
                    }

                    return NextResponse.json({ adminDashboardData })
                } catch (err) {
                    console.log(err)
                    return NextResponse.json({ err })
                }
            case 3: // Get all Ended Vaults
                try {
                    const querySnapshot = await getDocs(collection(db, "vaults"));
                    let endedVaults: Vault[] = []
                    let now = new Date().getTime()
                    querySnapshot.forEach((doc) => {
                        if (!doc.data().closed && doc.data().endDate < now) {
                            endedVaults.push(doc.data() as Vault)
                        }
                    });
                    return NextResponse.json({ endedVaults })
                } catch (err) {
                    console.log(err)
                    return NextResponse.json({ err })
                }
        }
    } catch (err) {
        console.log(err)
        return NextResponse.json({ err: "Option error" })
    }


}