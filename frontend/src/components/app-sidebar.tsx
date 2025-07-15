import { Calendar, Home, Inbox, Search, Settings, Sprout } from "lucide-react";
import { NavUser } from "@/components/nav-user";

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

import { ModeToggle } from "./mode-toggle";
import { auth, signOut } from "@/lib/auth";

const smartCropManagementItems = [
  {
    title: "Crop Planning Module",
    url: "/crop-management/crop-planning",
    icon: Home,
  },
  {
    title: "Disease & Pest Detection",
    url: "#",
    icon: Inbox,
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
    icon: Home,
  },
  {
    title: "Fertilizer & Pesticide Management",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Equipment & Technology Integration",
    url: "#",
    icon: Calendar,
  },
];

const marketIntelligentItems = [
  {
    title: "Price Analytics",
    url: "/market/price-prediction",
    icon: Home,
  },
  {
    title: "Marketplace",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Supply Chain Tracking",
    url: "#",
    icon: Calendar,
  },
];

const communityItems = [
  {
    title: "Farmer Forum",
    url: "/community/forum",
    icon: Home,
  },
  {
    title: "Expert Consultation",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Learning Center",
    url: "#",
    icon: Calendar,
  },
];

export async function AppSidebar() {
  const session = await auth();
  let datauser = {
    name: "default name",
    email: "default@gmail.com",
    avatar: "",
  };
  if (session) {
    datauser = {
      name: session.user?.name || "",
      email: session.user?.email || "",
      avatar: session.user?.image || "",
    };
  }

  const handleSignout = async () => {
    "use server";
    await signOut();
  };

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

        <SidebarGroup>
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
        </SidebarGroup>

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
