import { SignJWT, jwtVerify } from "jose";

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!);

export interface TokenPayload {
    sub: number;
    role: "ADMIN" | "ANALYST" | "VIEWER";
    tokenVersion: number;
}

export async function createAccessToken(payload: TokenPayload): Promise<string> {
    return new SignJWT({
        role: payload.role,
        tokenVersion: payload.tokenVersion,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(payload.sub.toString())
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(ACCESS_TOKEN_SECRET);
}

export async function createRefreshToken(payload: TokenPayload): Promise<string> {
    return new SignJWT({
        role: payload.role,
        tokenVersion: payload.tokenVersion,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(payload.sub.toString())
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(REFRESH_TOKEN_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET);
    return payload as unknown as TokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, REFRESH_TOKEN_SECRET);
    return payload as unknown as TokenPayload;
}