import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>회원 목록</h1>
      <p>회원 목록이 여기에 표시됩니다.</p>
    </div>
  );
}

