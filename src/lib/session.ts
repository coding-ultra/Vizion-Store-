import "server-only";
import {cookies} from "next/headers";
import {SignJWT,jwtVerify} from "jose";
import {requiredEnv} from "@/lib/env";
const COOKIE="vizionstore_session";
const secret=()=>{const value=requiredEnv("JWT_SECRET");if(value.length<32)throw new Error("JWT_SECRET must contain at least 32 characters.");return new TextEncoder().encode(value);};
export type SessionUser={id:string;email:string;name:string;role:"admin"|"user"};
export async function createSession(user:SessionUser){const token=await new SignJWT({email:user.email,name:user.name}).setProtectedHeader({alg:"HS256"}).setSubject(user.id).setIssuer("vizionstore").setAudience("vizionstore-web").setIssuedAt().setExpirationTime("7d").sign(secret());const jar=await cookies();jar.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*7});}
export async function destroySession(){const jar=await cookies();jar.delete(COOKIE);}
export async function readSessionId():Promise<string|null>{try{const jar=await cookies();const token=jar.get(COOKIE)?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret(),{issuer:"vizionstore",audience:"vizionstore-web"});return typeof payload.sub==="string"?payload.sub:null;}catch{return null;}}
