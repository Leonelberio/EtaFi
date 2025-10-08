import Image from "next/image";
import { cn } from "@/lib/utils";

// Removed next/font import for compatibility with current Next version

interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <div className="flex items-center gap-x-2">
        <Image
          src="/logo_etafi.png"
          alt="EtaFi Logo"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <h1
          className={cn(
            "text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
          )}
        >
          EtaFi
        </h1>
      </div>
      <p className="text-gray-600 text-base font-medium">{label}</p>
    </div>
  );
};
