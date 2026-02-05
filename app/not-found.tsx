import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="text-6xl font-bold text-gray-300">404</div>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 justify-center">
            <Button asChild variant="default">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/chart-of-accounts">
                <Search className="h-4 w-4 mr-2" />
                Browse Accounts
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Quick Links:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/journal-entries" className="text-sm text-blue-600 hover:underline">
                Journal Entries
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/trial-balance" className="text-sm text-blue-600 hover:underline">
                Trial Balance
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/financial-reports" className="text-sm text-blue-600 hover:underline">
                Financial Reports
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




