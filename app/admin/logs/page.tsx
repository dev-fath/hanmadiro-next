import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export default async function LogsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>발송 기록</h1>
      <p>발송 기록 목록이 여기에 표시됩니다.</p>
    </div>
  );
}

