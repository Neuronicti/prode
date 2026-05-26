import { NextRequest, NextResponse } from 'next/server'

// Session validation disabled — JWT stored in localStorage (client-side)
export default function proxy(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
}
