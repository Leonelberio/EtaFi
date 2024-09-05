"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bird, Rabbit, Turtle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react" // Importing session hook

export default function NewComparator() {
  const { data: session } = useSession() // Getting session data
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#000000")
  const [toolType, setToolType] = useState("")
  const [logo, setLogo] = useState<File | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      console.error("User is not authenticated")
      return
    }

    let logoUrl = ""
    if (logo) {
      const formData = new FormData()
      formData.append("file", logo)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadResponse.json()
      logoUrl = uploadData.url
    }

    const response = await fetch("/api/comparators", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        logo: logoUrl,
        color,
        toolType,
        ownerId: session.user.id, // Add ownerId from session
      }),
    })

    if (response.ok) {
      router.push("/web/comparators") // Redirect after creation
    } else {
      console.error("Échec de la création du comparateur")
    }
  }

  return (
    <div className="relative flex-col items-start gap-8 md:flex">
      <form className="grid w-full items-start gap-6" onSubmit={handleSubmit}>
        <fieldset className="grid gap-6 rounded-lg border p-4">
          <legend className="-ml-1 px-1 text-sm font-medium">Nouvel outil</legend>
          <div className="grid gap-3">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le nom du comparateur"
              required
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Entrez une description"
              required
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="logo">Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="color">Couleur</Label>
            <Input
              id="color"
              type="color"
              className="w-20"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="toolType">Type d`outil</Label>
            <Select onValueChange={setToolType}>
              <SelectTrigger id="toolType">
                <SelectValue placeholder="Sélectionnez un type d'outil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="genesis">
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Rabbit className="size-5" />
                    <div className="grid gap-0.5">
                      Comparateur
                    </div>
                  </div>
                </SelectItem>
                {/* Add other SelectItems if needed */}
              </SelectContent>
            </Select>
          </div>
        </fieldset>
        <Button type="submit">Créer</Button>
      </form>
    </div>
  )
}
