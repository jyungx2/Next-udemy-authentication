// server action
"use server";

import { createAuthSession, destroySession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { redirect } from "next/navigation";

export async function signup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  let errors = {};
  if (!email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }

  if (password.trim().length < 8) {
    errors.password = "Please must be at least 8 characters long.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
    };
  }

  // ⭐️ Store it in the database (create a new user)
  const hashedPassword = hashUserPassword(password); // 보안 문제로 hash 처리 필수!

  try {
    const id = createUser(email, hashedPassword);
    await createAuthSession(id);
    redirect("/training");
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email:
            "It seems like an account for the chosen email already exists.",
        },
      };
    }
    throw err;
  }

  /*
  2. 보안 문제점 지적
   - 현재 방식은 비밀번호가 평문으로 저장되는 💥심각한 보안 취약점💥이 있음
   - DB 관리자나 해커가 사용자 비밀번호를 그대로 볼 수 있음
   - 해킹 시 다른 사이트에도 같은 비밀번호를 사용할 수 있어 위험

  3. 해결 방안
   - 절대 평문 비밀번호를 저장하면 안 됨
   - 비밀번호는 반드시 ✨해시(hash)처리✨ 후 저장해야 함
   - 해시된 문자열은 원래 비밀번호로 복구할 수 없어 보안성 증가
  */
}

export async function login(prevState, formState) {
  const email = formState.get("email");
  const password = formState.get("password");

  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    return {
      errors: {
        email: "Could not authenticate user, please check your credentials.",
      },
    };
  }

  const isValidPassword = verifyPassword(existingUser.password, password);
  if (!isValidPassword) {
    return {
      errors: {
        email: "Could not authenticate user, please check your credentials.",
      },
    };
  }

  await createAuthSession(existingUser.id);
  redirect("/training");
}

export async function auth(mode, prevState, formData) {
  if (mode === "login") {
    return login(prevState, formData);
  }
  return signup(prevState, formData);
}

export async function logout() {
  await destroySession();
  redirect("/");
}
