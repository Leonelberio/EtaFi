"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
  hideHeader?: boolean;
  hideBackButton?: boolean;
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
  hideHeader,
  hideBackButton,
}: CardWrapperProps) => {
  return (
    <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm">
      {!hideHeader && (
        <CardHeader className="pb-4">
          <Header label={headerLabel} />
        </CardHeader>
      )}
      <CardContent className="space-y-6">{children}</CardContent>
      {showSocial && (
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <Social />
        </CardFooter>
      )}
      {!hideBackButton && (
        <CardFooter className="pt-4">
          <BackButton label={backButtonLabel} href={backButtonHref} />
        </CardFooter>
      )}
    </Card>
  );
};
