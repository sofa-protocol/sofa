import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Button } from "../ui/button";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { SHARKY_PROGRAM_ID, createSharkyClient } from "@sharkyfi/client";
import { useToast } from "../ui/use-toast";

export default function OfferLoan() {

    const anchorWallet = useAnchorWallet()
    const { toast } = useToast()


    const fetchOrderBooks = async () => {
        if (anchorWallet === null || anchorWallet === undefined) return
        // const connection = new Connection(process.env.RPC_ENDPOINT as string)
        const connection = new Connection("https://rpc.helius.xyz/?api-key=73ffd464-26a0-43c7-9d1a-3372360b6a8a")
        const provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())
        const sharkyClient = createSharkyClient(
            provider,
            new PublicKey(SHARKY_PROGRAM_ID),
            'mainnet'
        )
        const { program } = sharkyClient

        console.log({ sharkyClient })


        const allOrderBooks = await sharkyClient.fetchAllOrderBooks({
            program,
            // orderBookPubKey: new PublicKey("Fs32PjCnoh6Z5zPUm9ZVxaa6RB8T7BrK7Myec9Q7gvm5")
        })
        await Promise.all(
            allOrderBooks.map(async (orderBook) => {
                if (orderBook.orderBookType.nftList?.listAccount.toBase58() == "Fs32PjCnoh6Z5zPUm9ZVxaa6RB8T7BrK7Myec9Q7gvm5") {
                    console.log("found")
                    console.log({ orderBook })
                    const { offeredLoans, sig } = await orderBook.offerLoan({
                        program: sharkyClient.program,
                        principalLamports: 0.1 * LAMPORTS_PER_SOL,
                        onTransactionUpdate: console.dir,
                    })
                    toast({
                        title: `Loan offered! Its pubkey is: ${offeredLoans[0].pubKey.toString()}`,
                    })
                    console.log(
                        `Loan offered! Its pubkey is: ${offeredLoans[0].pubKey.toString()}`
                    )
                }
            })
        )
        return


        // await createProvider(wallet)
    }

    return (
        <Button onClick={fetchOrderBooks}>
            Offer Loan
        </Button>
    )
}