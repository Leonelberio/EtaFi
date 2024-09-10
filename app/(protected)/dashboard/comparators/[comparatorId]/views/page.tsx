"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ComparatorView from "@/app/(protected)/_components/compare-view";
import ListView from "@/app/(protected)/_components/list-view";

export default function ViewsTabs() {
  const {comparatorId} = useParams()
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabValue = searchParams.get("v") || "list"; // Default to "list" tab

  useEffect(() => {
    if (!searchParams.has("v")) {
      router.replace(`/dashboard/comparators/${comparatorId}/views?v=list`);
    }
  }, [comparatorId, router, searchParams]);

  const handleTabChange = (value:string) => {
    router.push(`/dashboard/comparators/${comparatorId}/views?v=${value}`);
  };

  return (
    <Tabs defaultValue={tabValue} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="list">Liste</TabsTrigger>
        <TabsTrigger value="compare">Comparateur</TabsTrigger>
        <TabsTrigger value="table">Tableau</TabsTrigger>
      </TabsList>
      <TabsContent value="list">
        <Card>
       
          <CardContent>
          <ListView />        

          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="compare">
        <Card>
          
          <CardContent>
<ComparatorView />        
 </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="table">
        <Card>
          
          <CardContent>
          <ComparatorView />        
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
