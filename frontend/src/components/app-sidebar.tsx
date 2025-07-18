"use client";

import { BarChart, BookOpen, Calendar, Cog, Droplets, Home, Inbox, MessagesSquare, Search, Settings, ShoppingCart, Sprout, Truck, Users } from "lucide-react"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { graphQLLogout } from "@/lib/graphql-auth";

import { ModeToggle } from "./mode-toggle";

const smartCropManagementItems = [
  {
    title: "Crop Planning Module",
    url: "/crop-management/crop-planning",
    icon: Sprout,
  },
  {
    title: "Disease & Pest Detection",
    url: "#",
    icon: Search,
  },
  {
    title: "Farming Calendar",
    url: "#",
    icon: Calendar,
  },
];

const resourceOptimizationItems = [
  {
    title: "Precision Irrigation System",
    url: "#",
    icon: Droplets,
  },
  {
    title: "Fertilizer & Pesticide Management",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Equipment & Technology Integration",
    url: "#",
    icon: Cog,
  },
];

const marketIntelligentItems = [
  {
    title: "Price Analytics",
    url: "/market/price-prediction",
    icon: BarChart,
  },
  {
    title: "Marketplace",
    url: "/market",
    icon: ShoppingCart,
  },
  {
    title: "Supply Chain Tracking",
    url: "#",
    icon: Truck,
  },
];

const communityItems = [
  {
    title: "Farmer Forum",
    url: "/community/forum",
    icon: Users,
  },
  {
    title: "Expert Consultation",
    url: "#",
    icon: MessagesSquare,
  },
  {
    title: "Learning Center",
    url: "#",
    icon: BookOpen,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  console.log("Session Data:", session);

  // const session = await auth();
  let datauser = {
    name: session?.user?.name || "abc",
    email: session?.user?.email || "abc",
    avatar: session?.user?.image || "abc",
  };
  // if (session) {
  //   datauser = {
  //     name: session.user?.name || "",
  //     email: session.user?.email || "",
  //     avatar: session.user?.image || "",
  //   };
  // }

  const handleSignout = async () => {
    // Clear GraphQL tokens
    graphQLLogout();

    // Sign out from NextAuth
    await signOut({ redirect: false });

    router.push("/login");
  };

  // Handle Loading State
  if (status === "loading") {
    return (
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Sprout />
                </div>
                <span className="text-lg font-semibold">AgroTech</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-10" />
          </div>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Sprout />
              </div>
              <span className="text-lg font-semibold">AgroTech</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Smart Crop Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {smartCropManagementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* <SidebarGroup>
          <SidebarGroupLabel>Resource Optimization</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceOptimizationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}

        <SidebarGroup>
          <SidebarGroupLabel>Market Intelligent Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {marketIntelligentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Community</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between">
          <NavUser user={datauser} handlesignout={handleSignout} />
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
