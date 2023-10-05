'use client'

import { UserDetailsProvider } from "@/context/user-context"

export default function DashboardLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode,
}) {

    return (
        <UserDetailsProvider>
            <section>
                <title> Sofa Protocol | Dashboard</title>
                {children}
            </section>
        </UserDetailsProvider>

    );
}