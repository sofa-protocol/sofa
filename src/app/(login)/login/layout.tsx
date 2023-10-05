
export default function LoginLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode,
}) {

    return (
        <section>
            <title> Sofa Protocol | Login</title>
            {children}
        </section>
    );
}