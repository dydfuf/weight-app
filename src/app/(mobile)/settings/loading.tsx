import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">설정</h1>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>유저 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-8 w-28" />
        </CardContent>
      </Card>
    </section>
  );
}
