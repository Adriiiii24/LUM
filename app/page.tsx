import { WorkbenchProvider } from '@/components/workbench/Workbench';
import { Preloader } from '@/components/site/Preloader';
import { BackgroundGrid } from '@/components/site/Grid';
import { SiteHeader } from '@/components/site/SiteHeader';
import { Hero } from '@/components/site/Hero';
import { ToolSection } from '@/components/site/ToolSection';
import { HowItWorks } from '@/components/explain/HowItWorks';
import { Evals } from '@/components/explain/Evals';
import { Limits } from '@/components/explain/Limits';
import { TryIt } from '@/components/site/TryIt';
import { SiteFooter } from '@/components/site/SiteFooter';
import { RevealObserver } from '@/components/site/Reveal';
import { SmoothScroll } from '@/components/site/SmoothScroll';
import { loadSample } from '@/lib/sample/load';

/**
 * Una sola página sobre una rejilla de 12 columnas: portada con el vídeo, el lienzo a sangre,
 * cómo funciona, lo que se mide, los límites y el cierre. El almacén del lienzo la envuelve
 * entera para que la cinta de la cabecera enseñe su estado.
 */
export default function Page() {
  const sample = loadSample();
  return (
    <WorkbenchProvider sample={sample}>
      <Preloader />
      <BackgroundGrid />
      <SiteHeader />
      {/* Destino del enlace de salto: recibe el foco, pero no es un control y no lleva contorno. */}
      <main id="contenido" tabIndex={-1} className="pt-14 focus-visible:outline-none md:pt-16">
        <Hero />
        <ToolSection />
        <HowItWorks sample={sample} />
        <Evals />
        <Limits />
        <TryIt sample={sample} />
      </main>
      <SiteFooter sample={sample} />
      <RevealObserver />
      <SmoothScroll />
    </WorkbenchProvider>
  );
}
