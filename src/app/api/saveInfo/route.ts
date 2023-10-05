import { authOptions } from "@/lib/const";
import { extractNumber } from "@/lib/helper";
import { Admin, UserDB, UserDashboard, Vault } from "@/lib/types";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, increment, setDoc, updateDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    const session = await getServerSession(authOptions);
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

    try {
        switch (reqBody.option) {
            case 0: // Add new user to database when first deposit
                try {
                    const { newUser, userAddress, vaultDetails } = reqBody

                    // Updating vault data
                    const vaultRef = doc(db, "vaults", `vault_${vaultDetails.id}`);
                    const vaultSnap = await getDoc(vaultRef);
                    let vault = vaultSnap.data() as Vault
                    vault.currVol += newUser.savingsAcc
                    vault.deposits.push({ address: userAddress, amount: newUser.savingsAcc, profitEarned: 0 })
                    await updateDoc(vaultRef, vault);

                    // Updating Admin data    
                    const adminRef = doc(db, "admin", "data");
                    await updateDoc(adminRef, {
                        totalSolDeposited: increment(newUser.savingsAcc),
                        revenue: increment(newUser.savingsAcc * 0.02) // 2% Management Fee
                    });

                    // Updating user data
                    await setDoc(doc(db, "users", userAddress), newUser);
                    return NextResponse.json({ status: true })
                } catch (err) {
                    console.log(err)
                    return NextResponse.json({ err })

                }
            case 1: // Deposit Sol to savings account
                try {
                    const { userAddress, amount, vaultDetails } = reqBody

                    // Udating vault data
                    const vaultRef = doc(db, "vaults", `vault_${vaultDetails.id}`);
                    const vaultSnap = await getDoc(vaultRef);
                    let vault = vaultSnap.data() as Vault
                    // Checking if vault is full
                    if (vault.currVol + amount > vault.maxVol) {
                        return NextResponse.json({ status: false, err: "Please deposit less amount" })
                    }
                    // Checking if vault has started
                    if (vault.startDate < new Date().getTime()) {
                        return NextResponse.json({ status: false, err: "Vault Already started" })
                    }
                    vault.currVol += amount
                    let vaultIndex = vault.deposits.findIndex(obj => obj.address === userAddress)
                    if (vaultIndex !== -1) {
                        vault.deposits[vaultIndex].amount += amount
                    } else {
                        vault.deposits.push({ address: userAddress, amount, profitEarned: 0 })
                    }
                    await updateDoc(vaultRef, vault);


                    // Updating user data
                    const docRef = doc(db, "users", userAddress);
                    const docSnap = await getDoc(docRef);
                    let user: UserDB = docSnap.data() as UserDB
                    const existingIndex = user.depositedVaults.findIndex(obj => obj.vaultId === vaultDetails.id);
                    if (existingIndex !== -1) {
                        user.depositedVaults[existingIndex].amount += amount;
                    } else {
                        user.depositedVaults.push({ vaultId: vaultDetails.id, amount, profitEarned: 0, endDate: vault.endDate, ended: false });
                    }
                    user.savingsAcc += amount
                    user.currPlan = vaultDetails.name
                    await updateDoc(docRef, user);

                    // Update Revenue on Admin Dashboard
                    const adminRef = doc(db, "admin", "data");
                    await updateDoc(adminRef, {
                        revenue: increment(amount * 0.02) // 2% Management Fee
                    });

                    let smallestEndDate: number | null = null
                    let daysLeft: number | null = null
                    let now = new Date().getTime()
                    user.depositedVaults.map((item) => {
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

                    let userDashboardData: UserDashboard = {
                        autoDeposit: user.autoDeposit,
                        currPlan: user.currPlan,
                        daysLeft,
                        depositedSol: user.depositedSol,
                        depositedVaults: user.depositedVaults,
                        profitEarned: user.profitEarned,
                        savingsAcc: user.savingsAcc
                    }

                    console.log({ user })
                    return NextResponse.json({ status: true, updatedData: userDashboardData })
                } catch (err) {
                    console.log(err)
                    return NextResponse.json({ status: false, err })
                }
            case 2: // Create Vault
                try {

                    //@ts-ignore
                    if (session.publicKey != process.env.ADMIN_1 && session.publicKey != process.env.ADMIN_2) {
                        return NextResponse.json({ success: false, err: "Not Authorized Admin" })
                    }
                    console.log("Creating vault...")
                    const { duration, startDate, endDate, size, name } = reqBody

                    let latestVault = 0
                    const querySnapshot = await getDocs(collection(db, "vaults"));
                    if (!querySnapshot.empty) {
                        console.log("Vaults exist")
                        querySnapshot.forEach((doc) => {
                            // doc.data() is never undefined for query doc snapshots
                            let currVault = extractNumber(doc.id)
                            if (currVault > latestVault) {
                                latestVault = currVault
                            }
                        });
                    }
                    await setDoc(doc(db, "vaults", `vault_${latestVault + 1}`), {
                        duration,
                        id: latestVault + 1,
                        startDate,
                        endDate,
                        maxVol: size,
                        totalProfit: 0,
                        name,
                        currVol: 0,
                        closed: false,
                        deposits: []
                    });
                    return NextResponse.json({ success: true })

                } catch (err) {
                    console.log(err)
                    return NextResponse.json({ success: false, err })
                }

        }
    } catch (err) {
        console.log(err)
    }


}