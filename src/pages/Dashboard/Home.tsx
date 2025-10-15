import { useEffect, useState, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import { get } from "../../api/service";
import { useAuth } from "../../context/AuthContext";

interface AdminOverview {
  users: { total: number; byRole: Record<string, number> };
  subjects: { total: number };
  groups: { total: number };
  quizzes: { total: number; thisWeek: number };
}

interface UpcomingQuizItem {
  id: number;
  title: string;
  start_time: string;
  subject?: { id: number; name: string };
}

interface RecentResultItem {
  quizId: number;
  quizTitle: string;
  studentId?: number;
  studentName?: string;
  score: number;
  submitted_at: string;
}

export default function Home() {
  const { role } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingQuizItem[]>([]);
  const [recent, setRecent] = useState<RecentResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (role === 'Student') {
        const res = await get("/dashboard/student/overview");
        const data = res.data as any;
        // Map student data to UI
        setOverview(null); // Student üçün admin KPI-ları göstərmirik
        setUpcoming((data.myUpcomingQuizzes || []).map((q: any) => ({
          id: q.id,
          title: q.title,
          start_time: q.start_time,
          subject: q.subject,
        })));
        setRecent((data.recentResults || []).map((r: any) => ({
          quizId: r.quiz_id,
          quizTitle: r.title ?? r.quizTitle ?? r.quiz?.title,
          score: Number(r.total_score ?? r.score ?? 0),
          submitted_at: r.submitted_at ?? r.createdAt,
        })));
      } else {
        const res = await get("/dashboard/admin/overview");
        setOverview(res.data as AdminOverview);
        setUpcoming([]);
        const rr = await get('/dashboard/admin/recent-results');
        setRecent(rr.data as RecentResultItem[]);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Dashboard məlumatlarını yükləmək mümkün olmadı");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <PageMeta title="Dashboard | QuizApp" description="QuizApp idarə paneli" />

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-300">
          {error}
        </div>
      )}

      {/* KPI Cards (yalnız Admin) */}
      {overview && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="İstifadəçilər" value={overview?.users.total ?? (loading ? "..." : 0)} subtitle={`Admin:${overview?.users.byRole?.Admin ?? 0} | Müəllim:${overview?.users.byRole?.Teacher ?? 0} | Tələbə:${overview?.users.byRole?.Student ?? 0}`} />
          <KpiCard title="Fənlər" value={overview?.subjects.total ?? (loading ? "..." : 0)} />
          <KpiCard title="Qruplar" value={overview?.groups.total ?? (loading ? "..." : 0)} />
          <KpiCard title="Quizlər" value={overview?.quizzes.total ?? (loading ? "..." : 0)} subtitle={`Bu həftə: ${overview?.quizzes.thisWeek ?? 0}`} />
        </div>
      )}

      {/* Upcoming & Recent only for Student */}
      {role === 'Student' && (
        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Yaxınlaşan Quizlər</h3>
            {loading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Yüklənir...</div>
            ) : upcoming.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Məlumat yoxdur</div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {upcoming.map((q) => (
                  <li key={q.id} className="py-2 text-sm text-gray-800 dark:text-gray-200">
                    <div className="font-medium">{q.title}</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {q.subject?.name ?? "-"} • {new Date(q.start_time).toLocaleString()}
                    </div>
                  </li>))}
              </ul>
            )}
          </div>

          {/* Recent Results */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Son Nəticələr</h3>
            {loading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Yüklənir...</div>
            ) : recent.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Məlumat yoxdur</div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recent.map((r) => (
                  <li key={`${r.quizId}-${r.submitted_at}`} className="py-2 text-sm text-gray-800 dark:text-gray-200">
                    <div className="font-medium">{r.quizTitle}</div>
                    <div className="text-gray-500 dark:text-gray-400">Bal: {r.score} • {new Date(r.submitted_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function KpiCard({ title, value, subtitle }: { title: string; value: number | string; subtitle?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>}
    </div>
  );
}
