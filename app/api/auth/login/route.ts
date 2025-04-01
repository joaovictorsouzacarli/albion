import { NextResponse } from "next/server"

// Credenciais fixas do administrador
const ADMIN_USERNAME = "TioBarney"
const ADMIN_PASSWORD = "javalol"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log("Tentativa de login:", { username })

    // Verificar se as credenciais correspondem às credenciais fixas
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log("Login bem-sucedido para:", username)

      // Retornar informações do usuário (sem senha)
      return NextResponse.json({
        username: ADMIN_USERNAME,
        role: "admin",
      })
    }

    // Credenciais inválidas
    console.log("Credenciais inválidas para:", username)
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

