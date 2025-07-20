import type { Metadata } from "next";
import GraphQLProvider from "@/providers/GraphQLProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import AuthSync from "@/components/auth-sync";
import ChatbotIcon from "@/components/chatbot-icon";

import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "AgroTech - Dashboard",
  description: "Smart Agricultural Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <GraphQLProvider>
      <SidebarProvider>
        <AuthSync />
        <AppSidebar />
        <SidebarTrigger />
        <main className="p-2 w-full">
          <Toaster position="top-right" />
          {children}
          <ChatbotIcon />
        </main>
      </SidebarProvider>
    </GraphQLProvider>
  );
}
