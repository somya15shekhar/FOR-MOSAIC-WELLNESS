import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Upload,
  Search,
  CheckCircle,
  Shield,
  ArrowRight,
  Receipt,
  FileText,
  TrendingUp,
  AlertTriangle,
  Users,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const auditRef = useRef<HTMLDivElement>(null);
  const savingsRef = useRef<HTMLDivElement>(null);
  const vendorRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from('.hero-label', {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.from('.hero-title', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power2.out',
      });

      gsap.from('.hero-subtitle', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.4,
        ease: 'power2.out',
      });

      gsap.from('.hero-cta', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.6,
        ease: 'power2.out',
      });

      gsap.from('.hero-card', {
        x: 100,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        delay: 0.3,
        ease: 'power2.out',
      });

      // Scroll-triggered animations
      const sections = [
        { ref: featuresRef, selector: '.feature-card' },
        { ref: howItWorksRef, selector: '.step-card' },
        { ref: auditRef, selector: '.audit-element' },
        { ref: savingsRef, selector: '.savings-element' },
        { ref: vendorRef, selector: '.vendor-element' },
        { ref: securityRef, selector: '.security-element' },
        { ref: testimonialsRef, selector: '.testimonial-card' },
        { ref: pricingRef, selector: '.pricing-card' },
      ];

      sections.forEach(({ ref, selector }) => {
        if (ref.current) {
          gsap.from(selector, {
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
            y: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
          });
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[rgba(11,13,16,0.08)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#2F8E92] rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-[#0B0D10]">InvoiceAI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection(featuresRef)} className="text-sm text-[#6B7280] hover:text-[#0B0D10] transition-colors">Product</button>
            <button onClick={() => scrollToSection(howItWorksRef)} className="text-sm text-[#6B7280] hover:text-[#0B0D10] transition-colors">How it works</button>
            <button onClick={() => scrollToSection(pricingRef)} className="text-sm text-[#6B7280] hover:text-[#0B0D10] transition-colors">Demo</button>
            <button onClick={() => scrollToSection(securityRef)} className="text-sm text-[#6B7280] hover:text-[#0B0D10] transition-colors">Security</button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button onClick={() => navigate('/login')} className="bg-[#2F8E92] hover:bg-[#3BA3A7]">
              Start free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen pt-16 dot-grid relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              <p className="hero-label text-micro text-[#2F8E92] mb-4">AI INVOICE AUDIT</p>
              <h1 className="hero-title text-5xl lg:text-6xl font-display font-semibold text-[#0B0D10] leading-tight mb-6">
                AI that audits vendor invoices and catches overcharges before payment.
              </h1>
              <p className="hero-subtitle text-lg text-[#6B7280] mb-8">
                Upload any invoice (PDF, image, or scan). Our AI extracts invoice data, verifies rates against contracts, detects GST errors, and flags discrepancies instantly.
              </p>
              <div className="hero-cta flex flex-wrap gap-4">
                <Button
                  onClick={() => navigate('/login')}
                  className="bg-[#2F8E92] hover:bg-[#3BA3A7] px-6 py-3 h-auto text-base gap-2"
                >
                  Audit an invoice
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => scrollToSection(howItWorksRef)}
                  className="px-6 py-3 h-auto text-base"
                >
                  See how it works
                </Button>
              </div>
            </div>

            {/* Right Content - Hero Card */}
            <div className="hero-card relative">
              <Card className="shadow-2xl border-0">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-semibold text-lg">Invoice Audit Summary</h3>
                    <span className="badge badge-accent">AI Audit Result</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-[rgba(11,13,16,0.02)] rounded-xl">
                      <span className="text-[#6B7280]">Billed</span>
                      <span className="font-semibold text-[#0B0D10]">₹12,400</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-[rgba(11,13,16,0.02)] rounded-xl">
                      <span className="text-[#6B7280]">Expected</span>
                      <span className="font-semibold text-[#0B0D10]">₹11,020</span>
                    </div>
                    <div className="h-px bg-[rgba(11,13,16,0.08)]" />
                    <div className="flex justify-between items-center p-4 bg-[rgba(16,185,129,0.08)] rounded-xl">
                      <span className="text-[#10B981] font-medium">Potential savings</span>
                      <span className="font-semibold text-[#10B981]">₹1,380</span>
                    </div>
                  </div>

                  <p className="text-center text-sm text-[#6B7280] mt-6">
                    11% of annual spend
                  </p>
                  <p className="text-center text-xs text-[#9CA3AF] mt-2">
                    OCR + AI powered invoice auditing
                  </p>
                </CardContent>
              </Card>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#2F8E92]/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#10B981]/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-24 bg-[#F6F7FA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-semibold text-[#0B0D10] mb-4">
              How it works
            </h2>
            <p className="text-lg text-[#6B7280]">
              Drop your invoices. We handle the reading, matching, and math.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                step: '1',
                title: 'Upload',
                description: 'Drag PDFs or images. We extract line items, dates, and totals.',
              },
              {
                icon: Search,
                step: '2',
                title: 'Audit',
                description: 'AI compares charges to contracts, history, and policy.',
              },
              {
                icon: CheckCircle,
                step: '3',
                title: 'Act',
                description: 'Approve, dispute, or export a clean report with evidence.',
              },
            ].map((item, index) => (
              <Card key={index} className="step-card card-hover border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[rgba(47,142,146,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-[#2F8E92]" />
                  </div>
                  <div className="text-micro text-[#2F8E92] mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-display font-semibold text-[#0B0D10] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[#6B7280]">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section ref={featuresRef} className="py-24 bg-[#F6F7FA] dot-grid">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="badge badge-accent mb-4">NEW</span>
              <h2 className="text-4xl font-display font-semibold text-[#0B0D10] mb-6">
                From upload to insight—in seconds.
              </h2>
              <p className="text-lg text-[#6B7280] mb-8">
                Our AI reads tables, handwritten notes, and multi-page bills. You get structured data you can query, filter, and export.
              </p>
              <ul className="space-y-4">
                {[
                  'Extract line items, tax, and vendor details',
                  'Auto-match against contracts and POs',
                  'Flag duplicates before payment',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                    <span className="text-[#0B0D10]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="shadow-2xl border-0">
              <CardContent className="p-6">
                <h3 className="font-display font-semibold mb-4">Extracted Charges</h3>
                <div className="space-y-3">
                  {[
                    { desc: 'Freight - Zone A', qty: 150, rate: 50, total: 7500 },
                    { desc: 'Handling Fee', qty: 1, rate: 120, total: 120, highlight: true },
                    { desc: 'Fuel Surcharge', qty: 1, rate: 380, total: 380 },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-3 rounded-lg ${item.highlight ? 'bg-[rgba(47,142,146,0.08)] border-l-4 border-[#2F8E92]' : 'bg-[rgba(11,13,16,0.02)]'
                        }`}
                    >
                      <div>
                        <p className="font-medium text-sm text-[#0B0D10]">{item.desc}</p>
                        <p className="text-xs text-[#6B7280]">{item.qty} × ${item.rate}</p>
                      </div>
                      <span className="font-semibold text-[#0B0D10]">${item.total}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Deep Audit View Section */}
      <section ref={auditRef} className="py-24 bg-[#F6F7FA]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="badge badge-accent mb-4">AUDIT RESULT</span>
            <h2 className="text-4xl font-display font-semibold text-[#0B0D10]">
              See every discrepancy clearly
            </h2>
          </div>

          <Card className="shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(11,13,16,0.08)]">
                <div>
                  <h3 className="font-display font-semibold text-lg">Invoice #2048-A</h3>
                  <p className="text-sm text-[#6B7280]">Vendor: Acme Logistics</p>
                </div>
                <span className="badge badge-warning">3 Issues Found</span>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="text-left text-micro text-[#6B7280]">
                    <th className="pb-4">Item</th>
                    <th className="pb-4">Billed</th>
                    <th className="pb-4">Expected</th>
                    <th className="pb-4">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: 'Freight', billed: 4200, expected: 3960, overage: 240 },
                    { item: 'Fuel Surcharge', billed: 380, expected: 310, overage: 70 },
                    { item: 'Handling', billed: 120, expected: 120, overage: 0, ok: true },
                  ].map((row, index) => (
                    <tr key={index} className="border-t border-[rgba(11,13,16,0.06)]">
                      <td className="py-4 font-medium">{row.item}</td>
                      <td className="py-4">${row.billed}</td>
                      <td className="py-4 text-[#6B7280]">${row.expected}</td>
                      <td className="py-4">
                        {row.ok ? (
                          <span className="badge badge-success">OK</span>
                        ) : (
                          <span className="text-[#EF4444] font-medium">+${row.overage}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 pt-4 border-t border-[rgba(11,13,16,0.08)] flex justify-between items-center">
                <span className="text-[#6B7280]">Total variance:</span>
                <span className="text-xl font-semibold text-[#EF4444]">$310</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Issues & Savings Section */}
      <section ref={savingsRef} className="py-24 bg-[#F6F7FA] dot-grid">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Issues Card */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-display font-semibold text-[#0B0D10] mb-6">
                  Issues found
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: AlertTriangle, text: 'Duplicate invoice detected', color: 'text-[#EF4444]', bg: 'bg-[rgba(239,68,68,0.1)]' },
                    { icon: TrendingUp, text: 'Rate higher than contract', color: 'text-[#F59E0B]', bg: 'bg-[rgba(245,158,11,0.1)]' },
                    { icon: FileText, text: 'Tax calculation mismatch', color: 'text-[#8B5CF6]', bg: 'bg-[rgba(139,92,246,0.1)]' },
                  ].map((issue, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-[rgba(11,13,16,0.02)] rounded-xl">
                      <div className={`w-10 h-10 ${issue.bg} rounded-lg flex items-center justify-center`}>
                        <issue.icon className={`w-5 h-5 ${issue.color}`} />
                      </div>
                      <span className="text-[#0B0D10]">{issue.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Savings Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-[#2F8E92] to-[#3BA3A7]">
              <CardContent className="p-8 text-white">
                <h3 className="text-2xl font-display font-semibold mb-6">
                  Total savings
                </h3>
                <p className="text-6xl font-display font-bold mb-4">
                  $1,380
                </p>
                <p className="text-white/80 mb-8">
                  11% of annual spend
                </p>

                <div className="flex gap-4">
                  <div className="flex-1 h-24 bg-white/10 rounded-xl flex items-end justify-center p-4">
                    <div className="w-8 bg-white/30 rounded-t-lg" style={{ height: '40%' }} />
                  </div>
                  <div className="flex-1 h-24 bg-white/10 rounded-xl flex items-end justify-center p-4">
                    <div className="w-8 bg-white/50 rounded-t-lg" style={{ height: '60%' }} />
                  </div>
                  <div className="flex-1 h-24 bg-white/10 rounded-xl flex items-end justify-center p-4">
                    <div className="w-8 bg-white rounded-t-lg" style={{ height: '85%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vendor Intelligence Section */}
      <section ref={vendorRef} className="py-24 bg-[#F6F7FA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-display font-semibold text-[#0B0D10] mb-6">
                Know your vendors.
              </h2>
              <p className="text-lg text-[#6B7280] mb-8">
                See billing patterns, on-time delivery, and dispute history—automatically.
              </p>
              <div className="space-y-4">
                {[
                  'Track vendor performance over time',
                  'Identify problematic billing patterns',
                  'Compare rates across vendors',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#2F8E92]" />
                    <span className="text-[#0B0D10]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[rgba(47,142,146,0.1)] rounded-full flex items-center justify-center">
                    <Users className="w-7 h-7 text-[#2F8E92]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">Acme Logistics</h3>
                    <span className="badge badge-accent text-xs">Score 94</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[rgba(11,13,16,0.02)] rounded-xl">
                    <p className="text-micro text-[#6B7280] mb-1">Invoices</p>
                    <p className="text-2xl font-semibold text-[#0B0D10]">3</p>
                    <p className="text-xs text-[#6B7280]">Last 30 days</p>
                  </div>
                  <div className="p-4 bg-[rgba(11,13,16,0.02)] rounded-xl">
                    <p className="text-micro text-[#6B7280] mb-1">On-time</p>
                    <p className="text-2xl font-semibold text-[#10B981]">98%</p>
                    <p className="text-xs text-[#6B7280]">Delivery rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section ref={securityRef} className="py-24 bg-[#F6F7FA] dot-grid">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-display font-semibold text-[#0B0D10] mb-12">
            Enterprise-grade security by default.
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: 'SOC 2 Type II',
                description: 'Continuous monitoring. Annual audits.',
              },
              {
                icon: Lock,
                title: 'Encryption',
                description: 'Data encrypted at rest and in transit.',
              },
            ].map((item, index) => (
              <Card key={index} className="card-hover border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 bg-[rgba(47,142,146,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-[#2F8E92]" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-[#0B0D10] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#6B7280]">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-24 bg-[#F6F7FA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-semibold text-[#0B0D10] mb-4">
              Trusted by finance teams.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: 'We cut invoice review time by 70%.',
                author: 'VP Finance, Retail',
              },
              {
                quote: 'The AI caught a duplicate we\'d missed for months.',
                author: 'Head of AP, Manufacturing',
              },
              {
                quote: 'Implementation took a day. ROI was visible in a week.',
                author: 'CFO, Logistics',
              },
            ].map((testimonial, index) => (
              <Card key={index} className="testimonial-card card-hover border-0 shadow-lg">
                <CardContent className="p-8">
                  <p className="text-lg text-[#0B0D10] mb-6 font-medium">
                    "{testimonial.quote}"
                  </p>
                  <p className="text-sm text-[#6B7280]">— {testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-24 bg-[#F6F7FA]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-semibold text-[#0B0D10] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-[#6B7280]">
              Start free, scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$0',
                period: '/mo',
                features: ['50 invoices/mo', 'Basic audit rules', 'Email support'],
                cta: 'Start free',
                outline: true,
              },
              {
                name: 'Growth',
                price: '$49',
                period: '/mo',
                features: ['500 invoices/mo', 'Advanced rules + exports', 'Priority support'],
                cta: 'Start free',
                popular: true,
              },
              {
                name: 'Scale',
                price: 'Custom',
                period: '',
                features: ['Unlimited invoices', 'SLA + dedicated support', 'Custom integrations'],
                cta: 'Contact sales',
                outline: true,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`pricing-card card-hover border-0 shadow-lg ${plan.popular ? 'ring-2 ring-[#2F8E92]' : ''}`}
              >
                <CardContent className="p-8">
                  {plan.popular && (
                    <span className="badge badge-accent mb-4">Most Popular</span>
                  )}
                  <h3 className="text-xl font-display font-semibold text-[#0B0D10] mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-display font-bold text-[#0B0D10]">
                      {plan.price}
                    </span>
                    <span className="text-[#6B7280]">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                        <span className="text-[#0B0D10]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => navigate('/login')}
                    className={`w-full ${plan.popular
                        ? 'bg-[#2F8E92] hover:bg-[#3BA3A7]'
                        : 'bg-white text-[#0B0D10] border border-[rgba(11,13,16,0.12)] hover:bg-[rgba(11,13,16,0.04)]'
                      }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 bg-[#0B0D10]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-display font-semibold text-white mb-4">
            Ready to stop overpaying?
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Get a demo or start your free trial today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => navigate('/login')}
              className="bg-[#2F8E92] hover:bg-[#3BA3A7] px-8 py-3 h-auto text-base"
            >
              Request demo
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3 h-auto text-base"
            >
              Start free trial
            </Button>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-8">
            {['Privacy', 'Terms', 'Security'].map((item) => (
              <button key={item} className="text-sm text-white/40 hover:text-white transition-colors">
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
