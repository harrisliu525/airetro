import { LocaleLink } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function HeroSection() {
  const t = useTranslations('HomePage.hero');
  const linkIntroduction = 'https://x.com/airetrostudio';
  const highlights = [
    t('highlights.speed'),
    t('highlights.modern'),
    t('highlights.custom'),
  ];

  return (
    <section id="hero" className="overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-20">
        <div className="lg:flex lg:items-center lg:gap-12">
          <div className="relative z-10 mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
            <LocaleLink
              href={linkIntroduction}
              className="rounded-(--radius) mx-auto flex w-fit items-center gap-2 border p-1 pr-3 lg:ml-0"
            >
              <span className="bg-muted rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs">
                {t('badge.status')}
              </span>
              <span className="text-sm">{t('introduction')}</span>
              <span className="bg-(--color-border) block h-4 w-px" />
              <ArrowRight className="size-4" />
            </LocaleLink>

            <h1 className="mt-10 text-balance text-4xl font-bold md:text-5xl xl:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-8 text-muted-foreground">{t('description')}</p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm font-medium lg:justify-start">
              {highlights.map((item) => (
                <span key={item} className="rounded-full border px-4 py-2">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute inset-0 -mx-4 rounded-3xl p-3 lg:col-span-3">
            <div className="relative">
              <div className="bg-radial-[at_65%_25%] to-background z-1 -inset-17 absolute from-transparent to-40%" />
              <Image
                className="hidden dark:block"
                src="/blocks/Hugyouryoungerself-dark.png"
                alt="Polaroid-style photo of an adult hugging their younger self in a cozy room"
                width={2796}
                height={2008}
                priority
              />
              <Image
                className="dark:hidden"
                src="/blocks/Hugyouryoungerself.png"
                alt="Polaroid-style photo of an adult hugging their childhood self against a bright backdrop"
                width={2796}
                height={2008}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
