/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        RPC_ENDPOINT: process.env.RPC_ENDPOINT,
        API_KEY: process.env.API_KEY,
        AUTH_DOMAIN: process.env.AUTH_DOMAIN,
        PROJECT_ID: process.env.PROJECT_ID,
        STORAGE_BUCKET: process.env.STORAGE_BUCKET,
        MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
        APP_ID: process.env.APP_ID,
        MEASUREMENT_ID: process.env.MEASUREMENT_ID,
        ADMIN_1: process.env.ADMIN_1,
        ADMIN_2: process.env.ADMIN_2,
        LIQUIDITY_PRIVATE_KEY: process.env.LIQUIDITY_PRIVATE_KEY,
        TESTING_PRIVATE_KEY: process.env.TESTING_PRIVATE_KEY,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    }
}

module.exports = nextConfig
