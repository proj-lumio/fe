import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Brain,
  FileStack,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const features = [
  {
    icon: Brain,
    title: "GraphRAG Intelligence",
    description:
      "Knowledge graphs built automatically from your documents. Surface hidden connections across companies, industries, and markets.",
  },
  {
    icon: FileStack,
    title: "Multimodal Ingestion",
    description:
      "Ingest PDFs, spreadsheets, presentations, audio, video, and more. Our pipeline extracts, chunks, and indexes everything automatically.",
  },
  {
    icon: MessageSquare,
    title: "Interactive Chat",
    description:
      "Ask natural-language questions about any company. Every answer is grounded in your documents with source attribution from vector search and graph entities.",
  },
  {
    icon: BarChart3,
    title: "Company Analytics & Ranking",
    description:
      "Score and rank companies based on document completeness, entity extraction, and relationship mapping. Track token usage and API performance.",
  },
]

const stats = [
  { value: "10x", label: "Faster due diligence" },
  { value: "99.7%", label: "Source accuracy" },
  { value: "50k+", label: "Documents processed daily" },
  { value: "200+", label: "Enterprise customers" },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Lumio</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Results
            </a>
            <a href="#cta" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Sign in
            </Button>
            <Button onClick={() => navigate("/login")}>
              Get Started
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Powered by GraphRAG
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Know your business.
            <br />
            <span className="text-primary">Before it changes.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Lumio is the AI-powered document intelligence platform for enterprise
            teams. Analyze companies, chat with your data using GraphRAG, and make
            decisions grounded in real documents -- not guesswork.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/login")}>
              Start Free Trial
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-border bg-muted/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need for document intelligence
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From ingestion to insight, Lumio handles the entire pipeline so your
            team can focus on decisions.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="transition-shadow hover:shadow-lg">
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-border bg-muted/50 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Enterprise-grade security</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="font-medium">SOC 2 Type II</span>
              <span className="text-sm text-muted-foreground">Audited annually</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Globe className="h-8 w-8 text-primary" />
              <span className="font-medium">Secure by Default</span>
              <span className="text-sm text-muted-foreground">End-to-end encryption</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              <span className="font-medium">99.99% Uptime</span>
              <span className="text-sm text-muted-foreground">Enterprise SLA</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-12 shadow-lg">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-4 text-muted-foreground">
            Join hundreds of enterprises using Lumio to transform their document
            workflows. Free 14-day trial, no credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/login")}>
              Start Free Trial
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Lumio</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
            <a href="#" className="hover:text-foreground transition-colors">Status</a>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Lumio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
