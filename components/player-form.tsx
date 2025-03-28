"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Check, Loader2 } from "lucide-react"

// Classes de DPS disponíveis
const DPS_CLASSES = [
  "FULGURANTE",
  "FURA-BRUMA",
  "ÁGUIA",
  "CHAMA SOMBRA",
  "ADAGAS",
  "FROST",
  "ENDEMONIADO",
  "QUEBRA REINO",
]

// Classe de HPS disponível
const HPS_CLASSES = ["QUEDA SANTA"]

export function PlayerForm() {
  const [formData, setFormData] = useState({
    playerName: "",
    type: "dps", // dps ou hps
    class: DPS_CLASSES[0],
    value: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
      class: value === "dps" ? DPS_CLASSES[0] : HPS_CLASSES[0],
    }))
  }

  const handleClassChange = (value: string) => {
    setFormData((prev) => ({ ...prev, class: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validação básica
    if (!formData.playerName || !formData.class || !formData.value) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Validação do valor numérico
    const valueNum = Number(formData.value)
    if (isNaN(valueNum) || valueNum <= 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser um número positivo",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      console.log("Enviando dados:", formData)

      const response = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName: formData.playerName,
          class: formData.class,
          value: formData.value,
          type: formData.type,
        }),
      })

      const data = await response.json()

      console.log("Resposta do servidor:", data)

      if (!response.ok) {
        throw new Error(data.error || "Erro ao adicionar registro")
      }

      toast({
        title: "Sucesso",
        description: "Registro adicionado com sucesso",
      })

      // Resetar formulário
      setFormData({
        playerName: "",
        type: "dps",
        class: DPS_CLASSES[0],
        value: "",
      })
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao adicionar registro",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-amber-900/50 bg-black/30">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName">Nome do Jogador</Label>
            <Input
              id="playerName"
              name="playerName"
              value={formData.playerName}
              onChange={handleChange}
              placeholder="Digite o nome do jogador"
              className="bg-black/50 border-amber-900/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Registro</Label>
            <RadioGroup value={formData.type} onValueChange={handleTypeChange} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dps" id="dps" className="border-amber-400 text-amber-400" />
                <Label htmlFor="dps">DPS (Dano)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hps" id="hps" className="border-amber-400 text-amber-400" />
                <Label htmlFor="hps">HPS (Cura)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Classe</Label>
            <Select value={formData.class} onValueChange={handleClassChange}>
              <SelectTrigger className="bg-black/50 border-amber-900/50">
                <SelectValue placeholder="Selecione a classe" />
              </SelectTrigger>
              <SelectContent className="bg-black border-amber-900/50">
                {formData.type === "dps"
                  ? DPS_CLASSES.map((dpsClass) => (
                      <SelectItem key={dpsClass} value={dpsClass}>
                        {dpsClass}
                      </SelectItem>
                    ))
                  : HPS_CLASSES.map((hpsClass) => (
                      <SelectItem key={hpsClass} value={hpsClass}>
                        {hpsClass}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">{formData.type === "dps" ? "Valor de DPS" : "Valor de HPS"}</Label>
            <Input
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="Digite o valor"
              type="number"
              min="1"
              className="bg-black/50 border-amber-900/50"
            />
          </div>

          <Button type="submit" className="w-full bg-amber-400 text-black hover:bg-amber-500" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                Salvar Registro
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        <Toaster />
      </CardContent>
    </Card>
  )
}

