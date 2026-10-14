import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Clock, Users, GitBranch, CheckSquare, ArrowRight } from "lucide-react";
import * as dashboardService from "@/services/dashboard";
import type { DashboardData } from "@/services/dashboard";

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(() => localStorage.getItem("fj_welcome_dismissed") !== "1");

  useEffect(() => {
    (async () => {
      try { setData(await dashboardService.getDashboard()); }
      catch (e: any) { setError(e.message || "Erro ao carregar painel"); }
      finally { setLoading(false); }
    })();
  }, []);

  const dismissWelcome = () => { localStorage.setItem("fj_welcome_dismissed", "1"); setShowWelcome(false); };

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando painel...</div>;

  if (error) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
      <div className="p-4 text-sm text-danger bg-danger-light rounded-lg" role="alert">{error} — verifique o Supabase (.env.local).</div>
    </div>
  );

  const cards = [
    { title: "Tarefas Atrasadas", value: data?.overdue ?? 0, hint: "Prazo vencido", icon: AlertTriangle, bg: "bg-danger-light", color: "text-danger", link: "/tarefas" },
    { title: "Tarefas de Hoje", value: data?.today ?? 0, hint: "Vencem hoje", icon: Clock, bg: "bg-warning-light", color: "text-warning", link: "/tarefas" },
    { title: "Aguardando Cliente", value: data?.waitingClient ?? 0, hint: "Parados no cliente", icon: Users, bg: "bg-primary-light", color: "text-primary", link: "/fluxo" },
    { title: "Casos Parados", value: data?.stalled ?? 0, hint: "Sem movimentação há 15+ dias", icon: GitBranch, bg: "bg-gray-100", color: "text-gray-500", link: "/casos" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
          <p className="text-gray-500 mt-1">O que precisa da sua atenção agora</p>
        </div>
        <Button onClick={() => navigate("/casos")}>Ver casos <ArrowRight className="h-4 w-4 ml-1" /></Button>
      </div>

      {showWelcome && (
        <div className="p-4 bg-primary-light border border-primary rounded-xl flex gap-3 flex-wrap items-center" role="region" aria-label="Boas-vindas">
          <div className="flex-1 min-w-[220px]">
            <p className="font-semibold text-gray-900">Bem-vindo ao Fluxo Jurídico 👋</p>
            <p className="text-sm text-gray-600 mt-0.5">Comece em 3 passos: 1) cadastre um cliente • 2) crie um caso com próxima ação e prazo • 3) acompanhe tudo aqui no painel.</p>
          </div>
          <Button size="sm" onClick={() => navigate("/clientes")}>Cadastrar cliente</Button>
          <button onClick={dismissWelcome} className="text-sm text-gray-500 hover:underline" aria-label="Dispensar boas-vindas">Dispensar</button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <button key={c.title} onClick={() => navigate(c.link)} className="text-left">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{c.title}</CardTitle>
                <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{c.value}</div>
                <p className="text-xs text-gray-500 mt-1">{c.hint}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" /> Minhas Próximas Ações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.nextActions.length ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium">Nenhuma próxima ação definida</p>
                <p className="text-sm mt-1">Defina a próxima ação dos seus casos</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {data.nextActions.map((a) => (
                  <li key={a.id} className="border rounded-lg p-3">
                    <p className="font-medium text-gray-900 text-sm">→ {a.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{a.title} • {a.client} • {a.stage}</p>
                    <div className="mt-1.5">
                      {a.deadline ? <Badge variant="info" size="sm">{a.deadline}</Badge> : <Badge variant="gray" size="sm">Sem prazo</Badge>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" /> Casos por Etapa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.byStage.length || data.byStage.every((s) => s.count === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium">Nenhum caso cadastrado</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {data.byStage.map((s) => (
                  <li key={s.stage_id} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 text-gray-700">{s.stage_name}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${data.byStage.reduce((t, x) => t + x.count, 0) ? (s.count / Math.max(1, data.byStage.reduce((t, x) => t + x.count, 0))) * 100 : 0}%` }} />
                    </div>
                    <span className="w-8 text-right font-medium text-gray-900">{s.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Casos Parados (mais de 15 dias sem atividade)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.stalledCases.length ? (
            <div className="text-center py-8 text-gray-500">
              <p className="font-medium">Nenhum caso parado</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.stalledCases.map((c) => (
                <li key={c.id} className="text-sm border rounded-lg p-3 flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-medium text-gray-900">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.client} • {c.stage}</p>
                  </div>
                  <Badge variant="danger" size="sm">{c.days} dias parado</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
