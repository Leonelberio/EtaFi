import BilanActif from '@/app/(protected)/_components/bilan-actif'
import BilanPassif from '@/app/(protected)/_components/bilan-passif'
import CompteResultat from '@/app/(protected)/_components/compte-resultat'
import FluxTresorerie from '@/app/(protected)/_components/flux-treso'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

function Page() {
  return (
    <Tabs defaultValue="bilan-actif" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="bilan-actif">Bilan Actif</TabsTrigger>
        <TabsTrigger value="bilan-passif">Bilan Passif</TabsTrigger>
        <TabsTrigger value="compte-resultat">Compte de Résultat</TabsTrigger>
        <TabsTrigger value="flux-treso">Flux de trésorerie</TabsTrigger>
      </TabsList>
      
      <TabsContent value="bilan-actif">
        <BilanActif />
      </TabsContent>

      <TabsContent value="bilan-passif">
        <BilanPassif />
      </TabsContent>

      <TabsContent value="compte-resultat">
        <CompteResultat />
      </TabsContent>

      <TabsContent value="flux-treso">
        <FluxTresorerie />
      </TabsContent>
    </Tabs>
  )
}

export default Page
