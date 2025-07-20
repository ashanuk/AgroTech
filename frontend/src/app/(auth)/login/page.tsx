import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { ModeToggle } from "@/components/mode-toggle";

export default async function LoginPage() {

  return (
    <div 
      className="min-h-svh bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('https://sharadpawaragricollege.com/wp-content/uploads/2023/05/agricultural.jpg')"
      }}
    >
      {/* Dark blurred overlay for the left side */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="grid min-h-svh lg:grid-cols-2 relative z-10">
        <div className="flex flex-col gap-4 p-6 md:p-10 bg-white/50 dark:bg-black/60 backdrop-blur-md">
          
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
              
              <LoginForm />

            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          {/* Right side is transparent to show the background image */}
        </div>
      </div>
    </div>
  )
}
