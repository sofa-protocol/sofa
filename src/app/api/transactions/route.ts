import { DEPOSITED_SOL, INTEREST, LIQUIDITY_ADDRESS, TREASURY_ADDRESS, authOptions } from "@/lib/const";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl, sendAndConfirmTransaction } from "@solana/web3.js";
import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, increment, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import bs58 from "bs58";
import { Admin, UserDB, Vault } from "@/lib/types";
import { getServerSession } from "next-auth";

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
    console.log("API Working")

    try {
        switch (reqBody.option) {
            case 0: // Distribute Profits 
                try {

                    //@ts-ignore
                    if (session.publicKey != process.env.ADMIN_1 && session.publicKey != process.env.ADMIN_2) {
                        return NextResponse.json({ success: false, err: "Not Authorized Admin" })
                    }

                    const { depositedSol, interest, vaultId, password } = reqBody
                    if (password !== process.env.ADMIN_PASSWORD) {
                        return NextResponse.json({ status: false, err: "Wrong Password" })
                    }

                    console.log("Password is correct")
                    console.log({ depositedSol, interest, vaultId, password })

                    let liquidityAddr = Keypair.fromSecretKey(
                        bs58.decode(process.env.LIQUIDITY_PRIVATE_KEY as string)
                    );
                    let transaction = new Transaction();
                    await transaction.add(
                        SystemProgram.transfer({
                            fromPubkey: liquidityAddr.publicKey,
                            toPubkey: new PublicKey(TREASURY_ADDRESS),
                            lamports: Math.floor(interest * 0.1 * LAMPORTS_PER_SOL), // 10% of Profit to Treasury
                        }),
                    );


                    // let connection = new Connection(process.env.RPC_ENDPOINT as string);
                    let connection = new Connection(clusterApiUrl("devnet"), "confirmed");
                    let txn = await sendAndConfirmTransaction(connection, transaction, [liquidityAddr]);
                    const latestBlockHash = await connection.getLatestBlockhash();
                    let txnConfirm = await connection.confirmTransaction({
                        blockhash: latestBlockHash.blockhash,
                        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                        signature: txn,
                    });

                    if (txnConfirm.value.err === null) {

                        console.log("Transaction is confirmed")
                        // Updating data on Admin Dashboard
                        const USERS_PROFIT = interest * 0.9
                        console.log({ USERS_PROFIT })
                        const adminRef = doc(db, "admin", "data");
                        let adminData = (await getDoc(adminRef)).data() as Admin
                        adminData.revenue += interest * 0.1
                        adminData.totalSolDeposited += USERS_PROFIT
                        adminData.tvl -= depositedSol
                        console.log("------------------")
                        console.log({ adminData })
                        console.log("------------------")

                        await updateDoc(adminRef, adminData);

                        // Updating data on Vault
                        const vaultRef = doc(db, "vaults", `vault_${vaultId}`);
                        const vaultSnap = await getDoc(vaultRef);
                        let vault: Vault = vaultSnap.data() as Vault
                        vault.totalProfit += interest
                        vault.closed = true
                        let vaultDepositedAddresses: string[] = []
                        await Promise.all(
                            vault.deposits.map(async (deposit, index) => {
                                vault.deposits[index].profitEarned = (deposit.amount / vault.currVol) * USERS_PROFIT
                                vaultDepositedAddresses.push(deposit.address)
                            })
                        )
                        await updateDoc(vaultRef, vault);

                        // Updating data on Users
                        await Promise.all(
                            vaultDepositedAddresses.map(async (address) => {
                                const userRef = doc(db, "users", address);
                                const userSnap = await getDoc(userRef);
                                let user = userSnap.data() as UserDB
                                let vaultIndex = user.depositedVaults.findIndex(obj => obj.vaultId === vault.id)
                                console.log("*****************")
                                console.log(vaultIndex)
                                console.log(vault.currVol)
                                console.log(user.depositedVaults[vaultIndex].amount)
                                console.log("*****************")
                                let profitGenerated = (user.depositedVaults[vaultIndex].amount / vault.currVol) * USERS_PROFIT
                                console.log({ profitGenerated })
                                user.depositedSol -= user.depositedVaults[vaultIndex].amount
                                user.depositedVaults[vaultIndex].profitEarned = profitGenerated
                                user.depositedVaults[vaultIndex].ended = true
                                if (!user.autoDeposit) {
                                    user.currPlan = null
                                }
                                user.profitEarned += profitGenerated
                                user.savingsAcc += profitGenerated + user.depositedVaults[vaultIndex].amount
                                await updateDoc(userRef, user)
                            })
                        )

                        return NextResponse.json({ status: true })
                    } else {
                        return NextResponse.json({ status: false })
                    }
                } catch (err) {
                    console.log(err)
                    return NextResponse.json({ status: false })
                }
            case 1: // Withdraw 
                try {
                    const { address, amount } = reqBody

                    // Update user data
                    const userRef = doc(db, "users", address);
                    const userSnap = await getDoc(userRef);
                    let user = userSnap.data() as UserDB
                    if (user.savingsAcc < amount) {
                        return NextResponse.json({ status: false, err: "No enough sol balance" })
                    }
                    user.savingsAcc -= amount;
                    let vaultId: number | null = null
                    for (let i = 0; i < user.depositedVaults.length; i++) {
                        if (!user.depositedVaults[i].ended) {
                            user.depositedVaults[i].amount -= amount;
                            vaultId = user.depositedVaults[i].vaultId
                            break
                        }
                    }
                    await updateDoc(userRef, user)

                    // Update vault data
                    if (vaultId !== null) {
                        const vaultRef = doc(db, "vaults", `vault_${vaultId}`);
                        const vaultSnap = await getDoc(vaultRef);
                        let vault = vaultSnap.data() as Vault
                        vault.deposits[vault.deposits.findIndex(obj => obj.address === address)].amount -= amount
                        vault.currVol -= amount
                        await updateDoc(vaultRef, vault)
                    }

                    // Update Admin data
                    const adminRef = doc(db, "admin", "data");
                    await updateDoc(adminRef, {
                        totalSolDeposited: increment(-amount),
                    });


                    let liquidityAddr = Keypair.fromSecretKey(
                        bs58.decode(process.env.LIQUIDITY_PRIVATE_KEY as string)
                    );
                    let transaction = new Transaction();
                    await transaction.add(
                        SystemProgram.transfer({
                            fromPubkey: liquidityAddr.publicKey,
                            toPubkey: new PublicKey(address),
                            lamports: Math.floor(amount * LAMPORTS_PER_SOL),
                        }),
                    );
                    let connection = new Connection(clusterApiUrl("devnet"), "confirmed");
                    let txn = await sendAndConfirmTransaction(connection, transaction, [liquidityAddr]);
                    const latestBlockHash = await connection.getLatestBlockhash();
                    let txnConfirm = await connection.confirmTransaction({
                        blockhash: latestBlockHash.blockhash,
                        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                        signature: txn,
                    });

                    if (txnConfirm.value.err === null) {

                        return NextResponse.json({ status: true })
                    } else {
                        return NextResponse.json({ status: false })
                    }
                }
                catch (err) {
                    console.log(err)
                    return NextResponse.json({ status: false })
                }

            case 2: // Lock Deposits
                try {

                    // Transfering all Sol in savings account to depositedSol
                    const userSnapshot = await getDocs(collection(db, "users"));
                    let tvl = 0
                    userSnapshot.forEach((userDb) => {
                        let user = userDb.data() as UserDB
                        if (user.autoDeposit) {
                            user.depositedSol += user.savingsAcc
                            tvl += user.savingsAcc
                            user.savingsAcc = 0
                            updateDoc(doc(db, "users", user.address), user)
                        }
                    })

                    // Updating Admin data
                    const adminRef = doc(db, "admin", "data");
                    await updateDoc(adminRef, {
                        tvl,
                    })

                    return NextResponse.json({ status: true })

                } catch (err) {
                    console.log(err)
                    return NextResponse.json({ status: false, err })
                }
        }
    } catch (err) {
        console.log(err)
    }
}