import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const refresh = request.cookies.get("refreshToken");

  const protectedRoutes = ["/Home", "/Profile"];
  const isProtected = protectedRoutes.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );
  if (isProtected && !refresh) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}