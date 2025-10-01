import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
    NavigationMenuViewport,
  } from "@/components/ui/navigation-menu"
  import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "./hooks/authProvider"
import api from "@/lib/axios"
  
  export function NavigationMenuDemo() {
    const router = useRouter()
    const {clearAuth, user} = useAuth()
    async function handleLogout(){
        clearAuth();
        await  api.post("/auth/logout");
        router.replace("/login")
    }
    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
                <div className="cursor-pointer w-[84px] h-full rounded-full 
                overflow-hidden shadow-[2px_1px_2px_1px_rgba(0,0,0,0.2)] hover:opacity-85 ">
                    <Image
                    src={user?.avatar ?? "/images/defaultAvatare.jpg"}
                    width={84}
                    height={84}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    />
                </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent className="bg-[#100C46] backdrop-blur-none
            whitespace-nowrap inline-block
            backdrop-brightness-100
            text-whitebg
            border-none
            " >
              <NavigationMenuLink>
                <button
                onClick={handleLogout}
                className="cursor-pointer px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground rounded"
                >
                Sign-Out
                </button>
              </NavigationMenuLink>
              <NavigationMenuLink href="/Profile">
                <button
                    className="cursor-pointer px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground rounded"
                    >
                    Profile
                </button>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
  
        {/* Keep this to preserve viewport animation */}
        <NavigationMenuViewport />
      </NavigationMenu>
    )
  }
  