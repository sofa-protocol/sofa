
export default function AdminLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode,
}) {

    return (
        <section>
            <title> Sofa Protocol | Admin</title>
            {children}
        </section>
    );
}