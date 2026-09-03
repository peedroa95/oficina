import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'development-only-secret-change-it');
export type Session = { userId:string; name:string; role:'ADMINISTRADOR'|'FUNCIONARIO' };
export async function createToken(data:Session){return new SignJWT(data).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('8h').sign(secret)}
export async function getSession():Promise<Session|null>{const token=(await cookies()).get('oficina_session')?.value;if(!token)return null;try{return (await jwtVerify(token,secret)).payload as unknown as Session}catch{return null}}
export async function requireAdmin(){const s=await getSession();if(!s||s.role!=='ADMINISTRADOR')throw new Error('Acesso não autorizado');return s}
