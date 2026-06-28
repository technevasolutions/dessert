import { cn } from '@/lib/utils';

export function Logo({
  className,
  size = 'md',
  tone = 'maroon',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'maroon' | 'cream' | 'gold';
}) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  };
  const tones = {
    maroon: 'text-maroon',
    cream: 'text-cream',
    gold: 'text-gold',
  };
  return (
    <span
      className={cn(
        'font-display italic font-semibold tracking-tight',
        sizes[size],
        tones[tone],
        className
      )}
    >
      Tempt<span className="text-gold">.</span>
    </span>
  );
}
