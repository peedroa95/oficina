import {NextRequest,NextResponse} from 'next/server';
export function middleware(req:NextRequest){const logged=!!req.cookies.get('oficina_session');if(!logged&&!req.nextUrl.pathname.startsWith('/login')&&!req.nextUrl.pathname.startsWith('/api/auth'))return NextResponse.redirect(new URL('/login',req.url));if(logged&&req.nextUrl.pathname==='/login')return NextResponse.redirect(new URL('/',req.url));return NextResponse.next()}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
