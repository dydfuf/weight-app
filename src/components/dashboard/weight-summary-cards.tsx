"use client";

import { endOfWeek, format, startOfWeek, subMonths, subWeeks } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, Minus, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

interface WeightSummary {
  latestWeight: number | null;
  weeklyChange: number | null;
  monthlyChange: number | null;
  lastRecordedAt: string | null;
}

interface WeightEntry {
  id: string;
  weight_kg: number;
  recorded_at: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface OptimisticWeightEntry {
  weight_kg: number;
  recorded_at: string;
  note?: string;
}

interface WeightSummaryCardsProps {
  optimisticEntry?: OptimisticWeightEntry | null;
  refreshTrigger?: number;
}

export function WeightSummaryCards({ optimisticEntry, refreshTrigger }: WeightSummaryCardsProps) {
  const [summary, setSummary] = useState<WeightSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchWeightSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 최근 체중 데이터 가져오기
      const { data: weights, error } = await supabase
        .from("weights")
        .select("weight_kg, recorded_at")
        .order("recorded_at", { ascending: false })
        .limit(30); // 최근 30일 데이터

      if (error) {
        throw error;
      }

      // 낙관적 업데이트 데이터가 있으면 우선 사용
      const allWeights = [...weights];
      if (optimisticEntry) {
        // 오늘 날짜의 기존 데이터가 있는지 확인
        const todayIndex = allWeights.findIndex(
          (w) => w.recorded_at === optimisticEntry.recorded_at,
        );
        if (todayIndex >= 0) {
          // 기존 데이터 업데이트
          (allWeights[todayIndex] as WeightEntry).weight_kg = optimisticEntry.weight_kg;
          (allWeights[todayIndex] as WeightEntry).note =
            optimisticEntry.note || (allWeights[todayIndex] as WeightEntry).note;
        } else {
          // 새 데이터 추가
          allWeights.push({
            id: "optimistic",
            weight_kg: optimisticEntry.weight_kg,
            recorded_at: optimisticEntry.recorded_at,
            note: optimisticEntry.note || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: "",
          } as WeightEntry);
        }
      }

      if (!allWeights || allWeights.length === 0) {
        setSummary({
          latestWeight: null,
          weeklyChange: null,
          monthlyChange: null,
          lastRecordedAt: null,
        });
        return;
      }

      const sortedWeights = allWeights.sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
      );

      const latestWeight = sortedWeights[0].weight_kg;
      const lastRecordedAt = sortedWeights[0].recorded_at;

      // 주간 변화 계산 (지난주 같은 요일 대비)
      const now = new Date();
      const lastWeek = subWeeks(now, 1);
      const lastWeekStart = startOfWeek(lastWeek, { weekStartsOn: 1 }); // 월요일 시작
      const lastWeekEnd = endOfWeek(lastWeek, { weekStartsOn: 1 });

      const lastWeekWeight = sortedWeights.find(
        (w) => new Date(w.recorded_at) >= lastWeekStart && new Date(w.recorded_at) <= lastWeekEnd,
      )?.weight_kg;

      let weeklyChange: number | null = null;
      if (lastWeekWeight) {
        weeklyChange = latestWeight - lastWeekWeight;
      }

      // 월간 변화 계산 (지난달 같은 날짜 대비)
      const lastMonth = subMonths(now, 1);
      const lastMonthWeight = sortedWeights.find(
        (w) => w.recorded_at <= lastMonth.toISOString().split("T")[0],
      )?.weight_kg;

      let monthlyChange: number | null = null;
      if (lastMonthWeight) {
        monthlyChange = latestWeight - lastMonthWeight;
      }

      setSummary({
        latestWeight,
        weeklyChange,
        monthlyChange,
        lastRecordedAt,
      });
    } catch (err) {
      console.error("체중 요약 데이터 로드 실패:", err);
      setError("데이터를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [supabase, optimisticEntry]);

  useEffect(() => {
    fetchWeightSummary();
  }, [fetchWeightSummary]);

  const formatChange = (change: number | null) => {
    if (change === null) return "데이터 없음";

    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}kg`;
  };

  const getChangeColor = (change: number | null) => {
    if (change === null) return "secondary";
    if (change > 0) return "destructive"; // 증가 (나쁨)
    if (change < 0) return "default"; // 감소 (좋음)
    return "secondary"; // 변화 없음
  };

  const getChangeIcon = (change: number | null) => {
    if (change === null) return <Minus className="h-4 w-4" />;
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 최근 체중 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">최근 체중</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary?.latestWeight ? `${summary.latestWeight.toFixed(1)}kg` : "기록 없음"}
          </div>
          {summary?.lastRecordedAt && (
            <p className="text-xs text-muted-foreground">
              <Calendar className="inline h-3 w-3 mr-1" />
              {format(new Date(summary.lastRecordedAt), "yyyy.MM.dd", { locale: ko })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 주간 변화 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">주간 변화</CardTitle>
          {summary ? getChangeIcon(summary.weeklyChange) : <Minus className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <Badge variant={summary ? getChangeColor(summary.weeklyChange) : "secondary"}>
              {summary ? formatChange(summary.weeklyChange) : "데이터 없음"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">지난주 같은 요일 대비</p>
        </CardContent>
      </Card>

      {/* 월간 변화 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">월간 변화</CardTitle>
          {summary ? getChangeIcon(summary.monthlyChange) : <Minus className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <Badge variant={summary ? getChangeColor(summary.monthlyChange) : "secondary"}>
              {summary ? formatChange(summary.monthlyChange) : "데이터 없음"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">지난달 같은 날짜 대비</p>
        </CardContent>
      </Card>
    </div>
  );
}
