"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { faqs } from "../data/policies";
import Reveal from "./Reveal";

export default function FaqAccordion() {
  // First question of the first group starts open.
  const [open, setOpen] = useState("0-0");

  return (
    <div className="space-y-12">
      {faqs.map((group, gi) => (
        <section key={group.group}>
          <h2 className="text-[13px] font-bold uppercase tracking-[2.5px] text-primary">
            {group.group}
          </h2>
          <span className="mt-3 block h-[2px] w-9 bg-primary" />

          <div className="mt-6 divide-y divide-line border-y border-line">
            {group.items.map((item, ii) => {
              const id = gi + "-" + ii;
              const isOpen = open === id;

              return (
                <Reveal key={item.q} delay={ii * 50}>
                  <h3>
                    <button
                      onClick={() => setOpen(isOpen ? null : id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:text-primary"
                    >
                      <span className="text-[16px] font-semibold leading-7 text-ink">
                        {item.q}
                      </span>
                      <Plus
                        size={20}
                        strokeWidth={2}
                        className={
                          "mt-1 shrink-0 text-primary transition-transform duration-300 " +
                          (isOpen ? "rotate-45" : "")
                        }
                      />
                    </button>
                  </h3>

                  <div
                    className="grid transition-all duration-400 ease-out"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-6 leading-8 text-muted sm:pr-10">{item.a}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
