import { ButtonLink } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main id="main" className="grid flex-1 place-items-center px-4 py-24">
      <div className="max-w-md text-center">
        <LogoMark className="mx-auto size-10" />
        <p className="mt-6 font-mono text-xs text-ink-3">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">This page is not in the index.</h1>
        <p className="mt-2 text-sm text-ink-2">The address may have changed, or the resource requires a different workspace.</p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/">Back to overview</ButtonLink>
          <ButtonLink href="/matrix" variant="secondary">
            Comparison matrix
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
