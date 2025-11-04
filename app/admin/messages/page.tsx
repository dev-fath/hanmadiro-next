import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>메시지 관리</h1>
      <p>메시지 목록 및 CRUD 기능이 여기에 표시됩니다.</p>
    </div>
  );
}

