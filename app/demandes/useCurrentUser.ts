// app/demandes/useCurrentUser.ts
import { useEffect, useState } from "react";

export interface User {
  email: string;
  role: string;
  userId: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userCookie = document.cookie.split("; ").find((row) => row.startsWith("trio_user="));

    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse user cookie", e);
        setUser(null);
      }
    }
  }, []);

  return user;
}
