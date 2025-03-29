import * as React from "react";

import { SearchForm } from "@/components/search-form";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ArrowLeft, SquarePen } from "lucide-react";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Today",
      url: "#",
      items: [
        {
          title: "Routing",
          url: "#",
        },
        {
          title: "Data Fetching",
          url: "#",
          isActive: true,
        },
        {
          title: "Rendering",
          url: "#",
        },
      ],
    },
    {
      title: "Yesterday",
      url: "#",
      items: [
        {
          title: "Components",
          url: "#",
        },
        {
          title: "File Conventions",
          url: "#",
        },
      ],
    },
    {
      title: "7 days ago",
      url: "#",
      items: [
        {
          title: "Accessibility",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex justify-between p-4">
        <div className="flex gap-2">
          <button>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2 ml-22">
            <span className="text-lg">Chat Baru</span>
            <button>
              <SquarePen className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="mt-6">
          <span className="px-4 text-sm font-medium text-gray-500">
            Hari Ini
          </span>
          <SidebarMenu className="mt-2">
            <SidebarMenuItem>
              <SidebarMenuButton className="px-4 py-2 w-full text-left">
                Saya punya ayam, cabai dan....
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
        <div className="mt-6">
          <span className="px-4 text-sm font-medium text-gray-500">
            7 Hari Lalu
          </span>
          {/* Add more menu items here if needed */}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
