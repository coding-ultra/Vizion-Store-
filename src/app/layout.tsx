import type { Metadata } from "next";import "./globals.css";
export const metadata:Metadata={title:"VIZIONSTORE — Digital Assets Marketplace",description:"Discover digital assets at VIZIONSTORE."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
