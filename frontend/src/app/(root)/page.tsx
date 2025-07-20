"use client"

import { SessionProvider } from "next-auth/react";

import Image from "next/image";
import { ChartLineInteractive } from "@/components/rice-price-chart";
import { redirect } from "next/navigation";

export default function Home() {

  return (
    <div className="flex-col">
      {/* <Image
        src="/logo.png"
        alt="AgroTech Logo"
        width={200}
        height={200}
        className="rounded-full"
      /> */}
      <h1 className="text-2xl font-bold mt-4">Dashboard</h1>
      <ChartLineInteractive />
      <div>
        <SessionProvider>
          <p>  </p>
        </SessionProvider>
      </div>
    </div>
  );
}
