import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="space-y-4 py-4">
      <h1 className="text-xl font-semibold">프로필</h1>
      <p className="text-sm text-muted-foreground">내 계정과 설정을 불러오는 중…</p>

      <Card>
        <CardHeader>
          <CardTitle>프로필 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </section>
  );
}
