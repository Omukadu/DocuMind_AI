import { Link } from 'react-router-dom';
import { Brain, FileText, Sparkles, Users, Shield, Zap, ChevronRight, Check, MessageSquare, Search, Upload } from 'lucide-react';

const features = [
  { icon: Upload, title: 'Smart Upload', desc: 'Drag & drop any document. PDF, Word, Excel, PowerPoint — all supported with automatic processing.' },
  { icon: Sparkles, title: 'AI Summaries', desc: 'Generate executive summaries, key insights, risks, and action items with one click.' },
  { icon: MessageSquare, title: 'Chat with Docs', desc: 'Ask questions, get answers with source citations. Chat across a document, folder, or your entire workspace.' },
  { icon: Search, title: 'Semantic Search', desc: 'Find exactly what you need across all your documents instantly.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Invite teammates, manage roles, and share documents with granular permissions.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access, audit logs, secure sharing with password protection and expiry dates.' },
];

const plans = [
  { name: 'Free', price: '$0', period: '/month', features: ['5 GB Storage', '3 Workspace Members', '100 AI Queries/mo', 'PDF & Word Support', 'Basic Search'], cta: 'Get Started', highlight: false },
  { name: 'Pro', price: '$29', period: '/month', features: ['100 GB Storage', '25 Members', '2,000 AI Queries/mo', 'All File Types', 'Advanced AI Summaries', 'Version History', 'Priority Support'], cta: 'Start Free Trial', highlight: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited Storage', 'Unlimited Members', 'Unlimited AI Queries', 'SSO & SAML', 'Audit Logs', 'Custom AI Models', 'Dedicated Support'], cta: 'Contact Sales', highlight: false },
];

const faqs = [
  { q: 'What file types are supported?', a: 'DocuMind AI supports PDF, Word (.doc/.docx), Excel (.xls/.xlsx), PowerPoint (.ppt/.pptx), plain text, CSV, and common image formats.' },
  { q: 'How does the AI chat work?', a: 'Our AI analyzes your documents and answers questions with direct citations to the source material. You can chat with a single document, a folder, or your entire workspace.' },
  { q: 'Is my data secure?', a: 'Absolutely. All data is encrypted at rest and in transit. We offer role-based access control, audit logging, and optional self-hosting for enterprise customers.' },
  { q: 'Can I connect my own AI model?', a: 'Yes. The AI layer is fully abstracted — you can connect OpenAI, Gemini, or Ollama by setting the AI_PROVIDER environment variable.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950 text-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-dark-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">DocuMind<span className="text-brand-400">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm py-2">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-600/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8">
            <Sparkles size={14} />
            AI-Powered Document Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Your documents,<br />
            <span className="gradient-text">smarter.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload, organize, and unlock insights from your documents with AI. Chat with your files, get instant summaries, and collaborate seamlessly with your team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 justify-center">
              Start for free <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5 justify-center">
              Sign in to workspace
            </Link>
          </div>
          <p className="text-gray-600 text-sm mt-6">No credit card required · Free plan forever</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything your team needs</h2>
            <p className="text-gray-400 max-w-xl mx-auto">From simple document storage to AI-powered analysis — DocuMind AI handles it all.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover group">
                <div className="w-11 h-11 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-600/20 transition-colors">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-24 px-6 bg-dark-900/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
                <Brain size={12} />
                AI-First Architecture
              </div>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">AI that reads your documents so you don't have to</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">Our abstracted AI layer works with OpenAI, Gemini, or local Ollama models. Start with mock responses, switch providers without changing a line of your workflow.</p>
              <ul className="space-y-4">
                {['Executive summaries in seconds', 'Key insights, risks & action items', 'Chat across multiple documents', 'Source-cited answers you can trust', 'Suggested follow-up questions'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-brand-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-500 font-mono">AI Workspace — Live Demo</span>
              </div>
              {[
                { role: 'user', text: 'Summarize the key risks in the Q1 financial report' },
                { role: 'ai', text: 'Based on the Q1 2024 Financial Report, I identified 3 key risks: (1) Resource constraints in Q3 due to peak demand, (2) Regulatory compliance updates may require plan revisions, (3) Third-party vendor dependencies...' },
                { role: 'user', text: 'What are the action items?' },
              ].map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Brain size={14} className="text-white" />
                    </div>
                  )}
                  <div className={`rounded-xl px-4 py-2.5 max-w-xs text-sm leading-relaxed ${msg.role === 'user' ? 'bg-brand-600/20 text-gray-200' : 'bg-dark-700 text-gray-300'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 bg-dark-700 rounded-lg px-3 py-2.5 text-sm text-gray-500">Ask anything about your documents...</div>
                <button className="btn-primary text-sm py-2 px-3">
                  <Zap size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400">Start free. Scale as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.name} className={`rounded-2xl p-8 border ${plan.highlight ? 'bg-brand-600/10 border-brand-500/30' : 'bg-dark-800 border-white/5'}`}>
                {plan.highlight && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500 text-white text-xs font-medium mb-4">
                    <Sparkles size={11} /> Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <Check size={14} className="text-brand-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center transition-all ${plan.highlight ? 'bg-brand-600 hover:bg-brand-500 text-white' : 'bg-dark-700 hover:bg-dark-600 text-gray-200 border border-white/5'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 border-t border-white/5 bg-dark-900/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="card">
                <h4 className="font-semibold text-white mb-2">{q}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to work smarter?</h2>
          <p className="text-gray-400 mb-8">Join thousands of teams using DocuMind AI to unlock the value in their documents.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-4 justify-center inline-flex">
            Start for free <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-brand-400" />
            <span className="font-semibold text-gray-400">DocuMind AI</span>
          </div>
          <p className="text-gray-600 text-sm">© 2024 DocuMind AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
