"use client";

import { useState } from "react";
import { RecentWeightEntries } from "@/components/dashboard/recent-weight-entries";
import { WeightSummaryCards } from "@/components/dashboard/weight-summary-cards";
import { WeightEntryForm } from "@/components/weight-entry-form";

interface OptimisticWeightEntry {
  weight_kg: number;
  recorded_at: string;
  note?: string;
}

export default function DashboardPage() {
  const [optimisticEntry, setOptimisticEntry] = useState<OptimisticWeightEntry | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleWeightEntrySuccess = (weightData: OptimisticWeightEntry) => {
    // 낙관적 업데이트: 즉시 UI 업데이트
    setOptimisticEntry(weightData);

    // 2초 후 실제 데이터 리프레시 (서버 요청 완료될 시간 고려)
    setTimeout(() => {
      setOptimisticEntry(null);
      setRefreshTrigger((prev) => prev + 1);
    }, 2000);
  };

  return (
    <section className="space-y-6 py-4">
      <div>
        <h1 className="text-xl font-semibold">대시보드</h1>
        <p className="text-sm text-muted-foreground">오늘의 요약을 확인하세요.</p>
      </div>

      {/* 체중 입력 폼 */}
      <WeightEntryForm onSuccess={handleWeightEntrySuccess} />

      {/* 요약 카드들 */}
      <WeightSummaryCards optimisticEntry={optimisticEntry} refreshTrigger={refreshTrigger} />

      {/* 최근 체중 기록 */}
      <RecentWeightEntries optimisticEntry={optimisticEntry} refreshTrigger={refreshTrigger} />
    </section>
  );
}
