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
import { AlertCircle } from "lucide-react"
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
              <Image src="/logo.png" alt="Infernus Logo" fill className="object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-amber-400">INFERNUS</h1>
          </Link>
        </div>

        <Card className="border-amber-900/50 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-amber-400">Login Administrativo</CardTitle>
            <CardDescription>Acesse o painel para gerenciar o ranking de caçadas</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-black/50 border-amber-900/50 focus:border-amber-400"
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
                  className="bg-black/50 border-amber-900/50 focus:border-amber-400"
                />
              </div>
              <Button type="submit" className="w-full bg-amber-400 text-black hover:bg-amber-500" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/" className="text-sm text-amber-400/70 hover:text-amber-400">
              Voltar para a página inicial
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

