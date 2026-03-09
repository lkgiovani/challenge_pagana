import { createRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BarChart3, Bot, CheckCircle2, Clock, Headset, MessageSquare, Shield, Users, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { rootRoute } from './__root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="flex min-h-full w-full flex-col bg-background">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-20 text-center lg:py-32">
        {/* Theme Toggle */}
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        {/* Badge */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Zap className="h-4 w-4 text-amber-500" />
          <span>Powered by AI</span>
        </div>

        {/* Title */}
        <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Sistema Inteligente de <span className="text-primary">Triagem de Atendimento</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground lg:text-xl">
          Automatize o primeiro contato com seus clientes usando inteligencia artificial. Reduza tempo de espera,
          melhore a experiencia do usuario e aumente a eficiencia da sua equipe.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild className="gap-2">
            <Link to="/atendimentos">
              <MessageSquare className="h-4 w-4" />
              Sou Cliente
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2">
            <Link to="/atendente">
              <Headset className="h-4 w-4" />
              Sou Atendente
            </Link>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <a href="#como-funciona">Como Funciona</a>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { value: '80%', label: 'Reducao no tempo de espera' },
            { value: '24/7', label: 'Disponibilidade' },
            { value: '95%', label: 'Satisfacao do cliente' },
            { value: '3x', label: 'Mais produtividade' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground lg:text-4xl">{stat.value}</span>
              <span className="mt-1 text-center text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="como-funciona" className="border-t border-border bg-secondary/30 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground lg:text-4xl">Como Funciona</h2>
            <p className="mt-4 text-muted-foreground">Um fluxo simples e eficiente para gerenciar seus atendimentos</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center rounded-xl border border-border bg-card p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-7 w-7" />
              </div>
              <span className="mt-4 text-sm font-medium text-muted-foreground">Etapa 1</span>
              <h3 className="mt-2 text-xl font-semibold text-foreground">Triagem com IA</h3>
              <p className="mt-3 text-muted-foreground">
                O bot de IA realiza o primeiro contato, coleta informacoes e identifica a necessidade do cliente.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center rounded-xl border border-border bg-card p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Users className="h-7 w-7" />
              </div>
              <span className="mt-4 text-sm font-medium text-muted-foreground">Etapa 2</span>
              <h3 className="mt-2 text-xl font-semibold text-foreground">Transferencia Inteligente</h3>
              <p className="mt-3 text-muted-foreground">
                Quando necessario, a conversa e transferida para um atendente humano com todo o contexto.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center rounded-xl border border-border bg-card p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MessageSquare className="h-7 w-7" />
              </div>
              <span className="mt-4 text-sm font-medium text-muted-foreground">Etapa 3</span>
              <h3 className="mt-2 text-xl font-semibold text-foreground">Atendimento Humanizado</h3>
              <p className="mt-3 text-muted-foreground">
                O atendente assume a conversa com todas as informacoes, proporcionando um atendimento rapido e
                eficiente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground lg:text-4xl">Beneficios</h2>
            <p className="mt-4 text-muted-foreground">Transforme seu atendimento ao cliente</p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Clock,
                title: 'Atendimento 24/7',
                description: 'Seus clientes podem iniciar conversas a qualquer momento',
              },
              {
                icon: BarChart3,
                title: 'Metricas em Tempo Real',
                description: 'Acompanhe o desempenho e tome decisoes baseadas em dados',
              },
              {
                icon: Shield,
                title: 'Seguro e Confiavel',
                description: 'Dados protegidos com criptografia de ponta a ponta',
              },
              {
                icon: CheckCircle2,
                title: 'Facil Integracao',
                description: 'Integre com seu sistema existente em minutos',
              },
            ].map(benefit => (
              <div
                key={benefit.title}
                className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <benefit.icon className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                <h3 className="mt-4 font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-secondary/30 px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground lg:text-4xl">Pronto para comecar?</h2>
          <p className="mt-4 text-muted-foreground">
            Acesse o painel de atendimentos e veja o sistema em acao com dados de demonstracao.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2" asChild>
              <Link to="/atendimentos">
                <MessageSquare className="h-4 w-4" />
                Painel do Cliente
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link to="/atendente">
                <Headset className="h-4 w-4" />
                Painel do Atendente
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Triagem IA</span>
          </div>
          <p className="text-sm text-muted-foreground">Sistema de Triagem de Atendimento Inteligente</p>
        </div>
      </footer>
    </div>
  )
}
