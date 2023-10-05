import { SendTransactionOptions } from "@solana/wallet-adapter-base";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl, sendAndConfirmTransaction } from "@solana/web3.js";
import { DEPOSITED_SOL, INTEREST, LIQUIDITY_ADDRESS, TREASURY_ADDRESS } from "./const";
import bs58 from "bs58";

export const sendSol = async (amount: number, wallet: WalletContextState): Promise<boolean> => {

    if (!wallet.publicKey) return false
    let transaction = new Transaction();
    await transaction.add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(TREASURY_ADDRESS),
            lamports: LAMPORTS_PER_SOL * amount * 0.02, // 2% Management fee
        }),
    );
    await transaction.add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(LIQUIDITY_ADDRESS),
            lamports: LAMPORTS_PER_SOL * amount * 0.98, // Deposit 98%
        }),
    );
    // let connection = new Connection(process.env.RPC_ENDPOINT as string);
    let connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    let txn = await wallet.sendTransaction(transaction, connection,);
    const latestBlockHash = await connection.getLatestBlockhash();
    let txnConfirm = await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txn,
    });
    //@ts-ignore
    if (txnConfirm.value.err === null) {
        return true
    } else {
        return false
    }
}
