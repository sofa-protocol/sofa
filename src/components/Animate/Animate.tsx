'use client'
import { useInView } from "framer-motion";
import { useRef } from "react";

type SectionProps = {
    children: any
    translate: string
    duration: string
    height?: string
    styles?: string
}

export default function Animate(props: SectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <section ref={ref} className={`${props.height} ${props.styles}`} >
            <div
                className={props.height}
                style={{
                    transform: isInView ? "none" : `${props.translate}`,
                    opacity: isInView ? 1 : 0,
                    transition: `all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) ${props.duration}`
                }}
            >
                {props.children}
            </div>
        </section>
    );
}