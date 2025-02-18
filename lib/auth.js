import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import db from "@/lib/db";
import { cookies } from "next/headers";

// SQLite DB와 연결하여 사용자와 세션을 저장할 테이블 지정
const adapter = new BetterSqlite3Adapter(db, {
  user: "users", // 사용자 정보가 저장될 테이블
  session: "sessions", // 세션 정보가 저장될 테이블
});

// Lucia 인증 설정
const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false, // 세션 만료 시간 없음
    attributes: {
      secure: process.env.NODE_ENV === "production", // production 환경에서만 secure 쿠키 사용
    },
  },
});

// 사용자 인증 세션 생성 및 쿠키 설정
export async function createAuthSession(userId) {
  const session = await lucia.createSession(userId, {}); // userId로 새 세션 생성
  const sessionCookie = lucia.createSessionCookie(session.id); // 생성된 세션ID로 쿠키 생성

  // next/headers의 cookies()를 사용해 쿠키 저장
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}
