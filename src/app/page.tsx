import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* 헤더 */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            체중 관리 앱
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            건강한 체중 관리를 위한 스마트한 솔루션입니다. 체중 기록, 목표 설정,
            분석까지 한 곳에서 관리하세요.
          </p>
        </header>

        {/* 주요 특징 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl mb-2">📊 체중 추적</CardTitle>
              <CardDescription>
                매일 체중을 기록하고 변화 추이를 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                날짜별 체중 기록과 그래프를 통해 변화 추이를 한눈에 볼 수
                있습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl mb-2">🎯 목표 관리</CardTitle>
              <CardDescription>
                개인 맞춤 목표를 설정하고 달성도를 추적하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                건강한 목표 체중을 설정하고 진행 상황을 실시간으로 확인하세요.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl mb-2">📈 분석 보고서</CardTitle>
              <CardDescription>
                체중 변화 패턴을 분석하고 인사이트를 얻으세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                체중 변화의 원인을 분석하고 건강 관리에 도움이 되는 인사이트를
                제공합니다.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            지금 시작해보세요
          </h2>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/ui">앱 시작하기 🚀</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              더 알아보기
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            개발 단계입니다. 현재는 데모 기능만 제공됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
