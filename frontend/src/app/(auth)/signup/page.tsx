import { GalleryVerticalEnd } from "lucide-react"

import { SignupForm } from "@/components/signup-form"
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export default async function SignupPage() {

  return (
    <div className="min-h-svh relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.squarespace-cdn.com/content/v1/51a39504e4b093105c265c24/1501051398703-N3U6OHJG0Z2R7BF6XG4L/glenn-guy-sunset-rice-bali.jpg?format=2500w')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Content */}
      <div className="grid min-h-svh lg:grid-cols-2 relative z-10">
        <div className="flex flex-col gap-4 p-6 md:p-10 bg-white/50 dark:bg-black/70 backdrop-blur-sm">
          
          <div className="flex gap-2 justify-between">
            <a href="#" className="flex items-center gap-2 font-medium text-black dark:text-white">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              AgroTech
            </a>
            <div><ModeToggle /></div>
          </div>
          
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              
              <SignupForm />

            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          {/* Right side shows the background image */}
        </div>
      </div>
    </div>
  )
}
