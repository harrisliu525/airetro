import { AiRetroLogo } from '@/components/layout/logo-ai-retro';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BuiltWithButton() {
  return (
    <Link
      target="_blank"
      href="https://ai-retro.com?utm_source=built-with-ai-retro"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'border border-border px-4 rounded-md'
      )}
    >
      <span>Built with</span>
      <span>
        <AiRetroLogo className="size-5 rounded-full" />
      </span>
      <span className="font-semibold">AI Retro</span>
    </Link>
  );
}
