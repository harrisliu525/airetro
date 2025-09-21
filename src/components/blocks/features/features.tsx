'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  ChartBarIncreasingIcon,
  Database,
  Fingerprint,
  IdCard,
} from 'lucide-react';
import type { ComponentType } from 'react';

type FeatureKey = 'item-1' | 'item-2' | 'item-3' | 'item-4';

type IconComponent = ComponentType<{ className?: string }>;

type FeatureVisual = {
  light: string;
  dark: string;
  alt: string;
};

const featureIcons: Record<FeatureKey, IconComponent> = {
  'item-1': Database,
  'item-2': Fingerprint,
  'item-3': IdCard,
  'item-4': ChartBarIncreasingIcon,
};

const featureImages: Record<FeatureKey, FeatureVisual> = {
  'item-1': {
    light: '/blocks/charts-light.png',
    dark: '/blocks/charts.png',
    alt: 'Analytics dashboard highlighting product performance metrics',
  },
  'item-2': {
    light: '/blocks/music-light.png',
    dark: '/blocks/music.png',
    alt: 'Creative collaboration workspace showing multi-user audio tools',
  },
  'item-3': {
    light: '/blocks/mail2-light.png',
    dark: '/blocks/mail2.png',
    alt: 'Inbox interface displaying automated messaging flows',
  },
  'item-4': {
    light: '/blocks/payments-light.png',
    dark: '/blocks/payments.png',
    alt: 'Payments dashboard illustrating revenue analytics and trends',
  },
};

export default function FeaturesSection() {
  const t = useTranslations('HomePage.features');

  return (
    <section id="features" className="overflow-hidden py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-0">
        <div className="max-w-2xl space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {t('title')}
          </p>
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            {t('subtitle')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('description')}
          </p>
        </div>

        <div className="relative -mx-4 rounded-3xl p-3 sm:-mx-8 lg:-mx-12">
          <div className="perspective-midrange">
            <div className="rotate-x-6 -skew-2">
              <div className="aspect-[88/36] relative overflow-hidden rounded-[calc(var(--radius-xl)*1.5)] border bg-background">
                <div className="bg-radial-[at_75%_25%] to-background z-10 -inset-17 absolute from-transparent to-75%" />
                <Image
                  src={featureImages['item-1'].light}
                  className="absolute inset-0 object-cover dark:hidden"
                  alt={featureImages['item-1'].alt}
                  width={2796}
                  height={1134}
                  priority
                />
                <Image
                  src={featureImages['item-1'].dark}
                  className="absolute inset-0 hidden object-cover dark:block"
                  alt={featureImages['item-1'].alt}
                  width={2796}
                  height={1134}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
          {(Object.keys(featureIcons) as FeatureKey[]).map((key) => {
            const Icon = featureIcons[key];
            return (
              <div
                key={key}
                className="space-y-3 rounded-2xl border bg-card/70 p-6 text-center shadow-sm"
              >
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                  <Icon className="size-4" />
                  <span>{t(`items.${key}.title`)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
