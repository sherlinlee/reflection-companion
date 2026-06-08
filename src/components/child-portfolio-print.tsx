"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReflectionSection } from "@/components/reflection-sections";
import type { Child, ChildReflection } from "@/lib/types";

const PORTFOLIO_PRINT_BODY_CLASS = "printing-portfolio";

function handlePortfolioPrint() {
  document.body.classList.add(PORTFOLIO_PRINT_BODY_CLASS);
  window.print();
  window.addEventListener(
    "afterprint",
    () => {
      document.body.classList.remove(PORTFOLIO_PRINT_BODY_CLASS);
    },
    { once: true },
  );
}

export type PortfolioObservation = {
  id: string;
  observation_text: string;
  observed_at: string;
  imageSignedUrl: string | null;
};

type Props = {
  child: Child;
  observations: PortfolioObservation[];
  childReflection: ChildReflection | null;
};

export function ChildPortfolioPrint({
  child,
  observations,
  childReflection,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (observations.length === 0) return null;

  const meta = [
    child.age != null ? `Age ${child.age}` : null,
    child.class_name,
  ]
    .filter(Boolean)
    .join(" · ");

  const printContent = (
    <div className="portfolio-print-only">
      <header className="portfolio-print-header">
        <h1 className="portfolio-print-name">{child.name}</h1>
        {meta && <p className="portfolio-print-meta">{meta}</p>}
        <p className="portfolio-print-brand">
          Documentation Portfolio · Spark by Sher
        </p>
      </header>

      <section className="portfolio-print-observations">
        {observations.map((obs) => (
          <article key={obs.id} className="portfolio-print-entry">
            <time dateTime={obs.observed_at} className="portfolio-print-date">
              {new Date(obs.observed_at).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
            </time>
            <p className="portfolio-print-text">{obs.observation_text}</p>
            {obs.imageSignedUrl && (
              <img
                src={obs.imageSignedUrl}
                alt=""
                className="portfolio-print-image"
              />
            )}
          </article>
        ))}
      </section>

      {childReflection && (
        <section className="portfolio-print-reflection">
          <h2 className="portfolio-print-section-title">
            Reflection across documentation
          </h2>
          <p className="portfolio-print-reflection-meta">
            Based on {childReflection.observation_count}{" "}
            {childReflection.observation_count === 1 ? "entry" : "entries"}
          </p>
          <ReflectionSection
            title="Patterns noticed"
            intro=""
            items={childReflection.patterns}
            variant="patterns"
          />
          <ReflectionSection
            title="Reflection questions"
            intro=""
            items={childReflection.questions}
            variant="questions"
          />
          <ReflectionSection
            title="Connections worth exploring"
            intro=""
            items={childReflection.connections}
            variant="connections"
          />
        </section>
      )}
    </div>
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="print:hidden"
        onClick={handlePortfolioPrint}
      >
        <Download className="size-3.5" />
        Download portfolio
      </Button>

      {mounted ? createPortal(printContent, document.body) : null}
    </>
  );
}
