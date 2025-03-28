import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log("Tentativa de login:", { username }) // Log para debug

    // Buscar usuário pelo username
    const { data: user, error: fetchError } = await supabase.from("users").select("*").eq("username", username).single()

    if (fetchError) {
      console.error("Erro ao buscar usuário:", fetchError)
      return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
    }

    console.log("Usuário encontrado:", user) // Log para debug

    // Verificar senha
    if (user.password !== password) {
      console.log("Senha incorreta") // Log para debug
      return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
    }

    // Retornar dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = user

    console.log("Login bem-sucedido:", userWithoutPassword) // Log para debug

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

