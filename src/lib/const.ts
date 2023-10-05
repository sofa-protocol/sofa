import { JWT } from "next-auth/jwt"
import { Orderbook, PlanDetails } from "./types"
import { AdapterUser } from "next-auth/adapters"
import { Account, NextAuthOptions, Profile, User } from "next-auth"
import { SigninMessage } from "./SignMessage"
import CredentialsProvider from "next-auth/providers/credentials";


export const LIQUIDITY_ADDRESS = "Axf8jUaWLLT1E4brg5TYtJ8EuvU2KvKGiuEUTyAKJbbb"
export const TREASURY_ADDRESS = "6vz9WMmuAdLbJybgx8XNJRKB8Ut2okfdftaWeKLHVb65"
export const DEPOSITED_SOL = 5
export const INTEREST = 0.103

export const plans: PlanDetails[] = [
    {
        name: "4 Seater",
        duration: 56,
        size: 100,
        apy: 160
    },
    {
        name: "6 Seater",
        duration: 7,
        size: 5,
        apy: 160
    },
    {
        name: "8 Seater",
        duration: 7,
        size: 5,
        apy: 160
    },
]

export const ORDERBOOK_PUBKEYS: Orderbook[] = [
    {
        name: "solcasino",
        pubkey: "EBm3znbydgWFzNRhkyKLoio7DYjSSnfnTXkD8Ky3P9o5"
    },
    {
        name: "degods",
        pubkey: "DpkLdzn6vQASVD1J5diUFCz2kVJfxkp9K5f5JEM1csz"
    },
    {
        name: "theheist",
        pubkey: "A26yzJ55VZaS7SdHZsD3WWy6vm7z9Cf4biuvi2fwwF35"
    },
    {
        name: "bodoggos",
        pubkey: "Fs32PjCnoh6Z5zPUm9ZVxaa6RB8T7BrK7Myec9Q7gvm5"
    },
    {
        name: "famousfoxfederation",
        pubkey: "Db2zA5Rf15CYYwXggNf2fdqRHi1MaguvbvgXVSgbM4Zi"
    },
    {
        name: "transdimensionalfoxfederation",
        pubkey: "HVSDUnFJvCq8g9CdhWmg6ned1huwXZphPHa8zqBKnnnd"
    }
]

export const authOptions: NextAuthOptions = {
    // https://next-auth.js.org/configuration/providers/oauth
    providers: [
        CredentialsProvider({
            name: "Solana",
            credentials: {
                message: {
                    label: "Message",
                    type: "text",
                },
                signature: {
                    label: "Signature",
                    type: "text",
                },
            },
            async authorize(credentials: any) {
                try {

                    const signinMessage = new SigninMessage(
                        JSON.parse(credentials?.message || "{}")
                    );
                    const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
                    if (signinMessage.domain !== nextAuthUrl.host) {
                        return null;
                    }
                    if (signinMessage.nonce !== credentials.csrfToken) {
                        return null;
                    }
                    const validationResult = await signinMessage.validate(
                        credentials?.signature || ""
                    );

                    if (!validationResult)
                        throw new Error("Could not validate the signed message");

                    return {
                        id: signinMessage.publicKey,
                    };
                } catch (e) {
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt(params: { token: JWT; user: AdapterUser | User; account: Account | null; profile?: Profile | undefined; trigger?: "update" | "signIn" | "signUp" | undefined; isNewUser?: boolean | undefined; session?: any; }) {
            if (params.token.sub == process.env.ADMIN_1 || params.token.sub == process.env.ADMIN_2) {
                params.token.role = "admin"
            } else {
                params.token.role = "user"
            }
            return params.token;
        },
        async session({ session, token }: any) {

            session.publicKey = token.sub;
            if (session.user) {
                session.user.name = token.sub;
                session.user.image = `https://ui-avatars.com/api/?name=${token.sub}&background=random`;
            }
            return session;
        },
    },
};