import { cn } from '@/lib/utils';
import Image from 'next/image';

export function AiRetroLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Logo of AI Retro"
      title="Logo of AI Retro"
      width={96}
      height={96}
      className={cn('size-8 rounded-md', className)}
    />
  );
}
