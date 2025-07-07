import Image from "next/image";
import { ChartLineInteractive } from "@/components/rice-price-chart";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  
  const session = await auth();
  if (!session) { redirect("/login"); }
  
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
    </div>
  );
}
