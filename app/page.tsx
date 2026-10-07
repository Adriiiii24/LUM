import { Workbench } from '@/components/workbench/Workbench';
import { Masthead } from '@/components/workbench/Masthead';
import { HowItWorks } from '@/components/explain/HowItWorks';
import { Evals } from '@/components/explain/Evals';
import { Limits } from '@/components/explain/Limits';
import { SiteFooter } from '@/components/explain/SiteFooter';
import { loadSample } from '@/lib/sample/load';

export default function Page() {
  const sample = loadSample();
  return (
    <>
      <main>
        <Workbench sample={sample} masthead={<Masthead />} />
        {/* Segunda lámina: el mismo marco y la misma rejilla de filetes que la herramienta. */}
        <div className="border-line-strong md:mx-[0.8rem] md:border md:border-b-0">
          <HowItWorks sample={sample} />
          <Evals />
          <Limits />
        </div>
      </main>
      <SiteFooter sample={sample} />
    </>
  );
}
