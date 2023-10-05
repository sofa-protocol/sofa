import NextAuth, { Account, NextAuthOptions, Profile, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import GithubProvider from 'next-auth/providers/github';
import TwitterProvider from 'next-auth/providers/twitter';
import Auth0Provider from 'next-auth/providers/auth0';
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from 'next-auth/react';
import { SigninMessage } from '@/lib/SignMessage';
import { JWT } from 'next-auth/jwt';
import { AdapterUser } from 'next-auth/adapters';

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options

const authOptions: NextAuthOptions = {
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
            }
            return session;
        },
    },
};




const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
