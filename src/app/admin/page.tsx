import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">관리자 페이지입니다.</p>
      <div>
        <Button asChild>
          <Link href="/admin/exercises/new">운동 추가하기</Link>
        </Button>
      </div>
    </div>
  );
}
