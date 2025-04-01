"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Enviando dados de login:", { username, password })

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      console.log("Resposta do servidor:", data)

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login")
      }

      // Salvar dados do usuário
      localStorage.setItem("admin", JSON.stringify(data))
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Erro no login:", error)
      setError(error instanceof Error ? error.message : "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Image src="/logo.png" alt="Neve Eterna Logo" fill className="object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-[#00c8ff]">NEVE ETERNA</h1>
          </Link>
        </div>

        <Card className="border-blue-900/50 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-[#00c8ff]">Login Administrativo</CardTitle>
            <CardDescription>Acesse o painel para gerenciar o ranking de caçadas</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert className="mb-4 bg-blue-900/20 border-blue-900/50">
              <Info className="h-4 w-4 text-[#00c8ff]" />
              <AlertDescription className="text-[#00c8ff]/80">Usuário: TioBarney</AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-black/50 border-blue-900/50 focus:border-[#00c8ff]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/50 border-blue-900/50 focus:border-[#00c8ff]"
                />
              </div>
              <Button type="submit" className="w-full bg-[#00c8ff] text-black hover:bg-[#00c8ff]/80" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/" className="text-sm text-[#00c8ff]/70 hover:text-[#00c8ff]">
              Voltar para a página inicial
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

