import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export default async function PushPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>수동 푸시 발송</h1>
      <p>수동 푸시 발송 기능이 여기에 표시됩니다.</p>
    </div>
  );
}

