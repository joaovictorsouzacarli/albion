import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-blue-900/50 bg-black">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-16 h-16 overflow-hidden">
            <Image src="/logo.png" alt="Neve Eterna Logo" fill className="object-contain" />
          </div>
          <span className="text-2xl font-bold text-[#00c8ff]">NEVE ETERNA</span>
        </Link>
        <nav>
          <Link href="/admin/login">
            <Button variant="outline" className="border-[#00c8ff] text-[#00c8ff] hover:bg-[#00c8ff]/10">
              Área Administrativa
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

