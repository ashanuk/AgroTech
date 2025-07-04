import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

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
  SidebarFooter
} from "@/components/ui/sidebar"

import { ModeToggle } from "./mode-toggle"

const smartCropManagementItems = [
  {
    title: "Crop Planning Module",
    url: "#",
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
]

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
]

const marketIntelligentItems = [
  {
    title: "Price Analytics",
    url: "#",
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
]

const communityItems = [
  {
    title: "Farmer Forum",
    url: "#",
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
]

export function AppSidebar() {
  return (
    <Sidebar>
      

        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    
                    <span className="text-xl font-bold">AgroTech</span>
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
          <SidebarMenu>
            <SidebarMenuItem>
                <span className="flex justify-between items-center gap-2">
                    <p>N. Wimaladarmasooriya</p>
                    <ModeToggle />
                </span>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                    
                </SidebarMenuButton>
              
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}