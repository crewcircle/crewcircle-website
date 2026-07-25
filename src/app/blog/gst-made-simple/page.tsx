import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GstMadeSimple() {
  return (
    <div className="min-h-screen bg-background py-12">
      <article className="max-w-3xl mx-auto px-6">
        <Link href="/blog" className="text-accent hover:text-accent/80 font-medium mb-8 inline-block">← Back to Blog</Link>
        <h1 className="text-4xl font-bold text-foreground mb-4">GST Made Simple: A Guide for Australian Small Business</h1>
        <p className="text-sm text-muted-foreground mb-8">April 25, 2026 • 6 min read</p>

        <div className="prose prose-gray max-w-none space-y-4 text-muted-foreground">
          <p>GST doesn&apos;t have to be a headache. Here&apos;s the stripped-down version every Aussie business owner needs.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">Do I need to register?</h2>
          <p>If your turnover is $75,000 or more, yes. If you&apos;re under that, you can still register voluntarily — useful if you want to claim back GST on your purchases.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">What gets GST?</h2>
          <p>Most things you sell: products, services, digital goods. Some things don&apos;t: fresh food, rent, education, medical services, and exports.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">How it works</h2>
          <p>You charge 10% GST on sales. You claim back the GST you paid on business purchases. The difference goes to the ATO each quarter.</p>
          <p>Example: You sell $1,000 worth of work. You collect $100 GST. You spent $330 on supplies and paid $33 GST. You owe the ATO $100 − $33 = $67.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">Common mistakes</h2>
          <p><strong>Mixing personal and business.</strong> If you claim GST on a purchase, you need a tax invoice and it must be business-related. ATO audits love catching this.</p>
          <p><strong>Missing BAS deadlines.</strong> Late lodgement means penalties. Set reminders for quarterly BAS — due 28 days after quarter end.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">Tools that help</h2>
          <p>CrewCircle handles award-rate calculations with GST baked in. Pair it with accounting software like Xero or MYOB to keep BAS ready year-round.</p>
        </div>

        <div className="mt-12 text-center">
          <Button variant="accent" size="xl" className="font-bold" render={<Link href="/" />}>Back to Home</Button>
        </div>
      </article>
    </div>
  );
}
