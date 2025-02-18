/*
1. lib 폴더에 user.js 파일을 생성하여 createUser 함수를 구현
  - 이메일과 비밀번호를 받아 데이터베이스에 저장하는 역할
  - DB import 후 SQLite를 사용해 users 테이블에 데이터 삽입
  - better-sqlite3 패키지의 prepare, run 메서드 활용
*/

import db from "@/lib/db";

export function createUser(email, password) {
  const result = db
    .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
    .run(email, password);
  return result.lastInsertRowid;
}

export function getUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}
