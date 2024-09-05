import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import HomeComponent from "./(protected)/_components/home";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Home() {
  return (
//     <main className="flex h-full flex-col items-center justify-center bg-muted">
//       <div className="space-y-6 text-center">
//         <h1
//           className={cn(
//             "text-6xl font-semibold text-black",
//             font.className
//           )}
//         >
//          🙂 Générateur de <br/>comparateurs
//         </h1>
//         <p className="text-black text-lg">Le Générateur de comparateurs</p>
//         <div>
//           <LoginButton asChild>
//             <Button size="lg">
// Se connecter            </Button>
//           </LoginButton>
//         </div>
//       </div>
//     </main>
<>
<HomeComponent/>
</>
  );
}
