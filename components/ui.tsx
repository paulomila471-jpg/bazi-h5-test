import { clsx } from "clsx";

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={clsx(
        "gold-border rounded-lg bg-white/[0.045] p-5 shadow-aureate backdrop-blur",
        className
      )}
    >
      {children}
    </section>
  );
}

export function PrimaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-12 w-full items-center justify-center rounded-md bg-gold px-4 py-3 text-sm font-semibold text-[#08101d] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm text-[#e6d4ad]">{children}</label>;
}

export const fieldClass =
  "min-h-12 w-full rounded-md border border-gold/20 bg-[#07111f] px-3 py-3 text-sm text-[#fff7e8] outline-none ring-0 placeholder:text-slate-500 focus:border-gold/70";
