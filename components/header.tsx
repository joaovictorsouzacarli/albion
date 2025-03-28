import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-amber-900/50 bg-black">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-12 h-12 overflow-hidden">
            <Image src="/logo.png" alt="Infernus Logo" fill className="object-contain" />
          </div>
          <span className="text-2xl font-bold text-amber-400">INFERNUS</span>
        </Link>
        <nav>
          <Link href="/admin/login">
            <Button variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400/10">
              Área Administrativa
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

