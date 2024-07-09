import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";

interface LayoutProps {
    children: ReactNode
}

const Layout= async ({ children }: LayoutProps) => {

    const session = await getServerSession(authOptions)

    if(!session) notFound()

    return <div className="w-full flex h-screen ">
        <div className="flex h-full w-full">

        </div>
        {children}</div>
}

export default Layout