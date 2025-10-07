import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const hasRefreshToken = request.cookies.has("refreshToken");
  const protectedRoutes = ["/Home", "/Profile"];
  const isProtected = protectedRoutes.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !hasRefreshToken) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Home/:path*", "/Profile/:path*"],
};
