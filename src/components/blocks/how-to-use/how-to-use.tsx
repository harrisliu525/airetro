'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Palette, Sparkles, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

const steps = [
  {
    key: 'upload',
    icon: Upload,
  },
  {
    key: 'mode',
    icon: Palette,
  },
  {
    key: 'generate',
    icon: Sparkles,
  },
] as const;

export default function HowToUseSection({ className }: { className?: string }) {
  const t = useTranslations('HomePage.howToUse');

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('label')}
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold lg:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-10 grid max-w-sm gap-6 [--color-background:var(--color-muted)] [--color-card:var(--color-muted)] *:text-center md:mt-16 dark:[--color-muted:var(--color-zinc-900)]">
          {steps.map(({ key, icon: Icon }) => (
            <Card key={key} className="group border-0 bg-transparent shadow-none">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Icon className="size-6" aria-hidden />
                </CardDecorator>
                <h3 className="mt-6 text-lg font-medium">
                  {t(`steps.${key}.title`)}
                </h3>
              </CardHeader>

              <CardContent>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`steps.${key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
    />
    <div
      aria-hidden
      className="bg-radial to-background absolute inset-0 from-transparent to-75%"
    />
    <div className="dark:bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t bg-white">
      {children}
    </div>
  </div>
);
