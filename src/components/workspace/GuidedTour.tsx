import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CircleHelp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUILT_IN_TOURS, TOUR_VERSION, type TourDefinition, type TourRole } from "@/lib/guided-tours";
import { getTourContext, saveTourProgress } from "@/lib/guided-tours.functions";

type TourSurface = "account" | "company" | "member" | "partner" | "staff";

function roleForSurface(surface: TourSurface, roles: TourRole[]): TourRole | null {
  if (surface === "account") return roles.includes("workspace_switcher") ? "workspace_switcher" : null;
  if (surface === "member") return roles.includes("directory_member") ? "directory_member" : null;
  if (surface === "partner") return roles.includes("partner") ? "partner" : null;
  if (surface === "company") return roles.find((role) => role === "founder_owner" || role === "editing_member" || role === "viewer") ?? null;
  return roles.find((role) => role === "admin_ceo" || role === "operations_lead" || role === "compliance_coordinator") ?? null;
}

export function GuidedTour({ surface, compact = false }: { surface: TourSurface; compact?: boolean }) {
  const load = useServerFn(getTourContext);
  const save = useServerFn(saveTourProgress);
  const { data, refetch } = useQuery({ queryKey: ["guided-tour-context"], queryFn: () => load(), staleTime: 0, refetchOnWindowFocus: true });
  const role = data ? roleForSurface(surface, data.roles as TourRole[]) : null;
  const builtIn = role ? BUILT_IN_TOURS[role] : null;
  const definition = useMemo(() => {
    if (!builtIn) return null;
    const content = data?.publishedContent as { items?: { q: string; a: string }[] } | null | undefined;
    const replacement = content?.items?.find((item) => item.q === builtIn.label);
    if (!replacement) return builtIn;
    return { ...builtIn, steps: [{ ...builtIn.steps[0], title: replacement.q, body: replacement.a }] } satisfies TourDefinition;
  }, [builtIn, data?.publishedContent]);
  const saved = definition ? data?.progress.find((row) => row.role_key === definition.role && row.tour_key === definition.key && row.tour_version === TOUR_VERSION) : null;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const firstDecisionMade = useRef(false);

  useEffect(() => {
    if (!definition || firstDecisionMade.current) return;
    firstDecisionMade.current = true;
    if (!saved || saved.status === "started") {
      setStep(Math.min(saved?.current_step ?? 0, definition.steps.length - 1));
      setOpen(true);
    }
  }, [definition, saved]);

  useEffect(() => {
    if (!open) return;
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") void closeAs("skipped");
      if (event.key === "ArrowLeft") setStep((current) => Math.max(0, current - 1));
      if (event.key === "ArrowRight" && definition) setStep((current) => Math.min(definition.steps.length - 1, current + 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, definition]);

  const current = useMemo(() => definition?.steps[step], [definition, step]);
  if (!definition || !current) return null;

  async function write(nextStep: number, status: "started" | "skipped" | "completed") {
    if (!definition) return;
    await save({ data: { role: definition.role, tourKey: definition.key, version: TOUR_VERSION, step: nextStep, status } });
    await refetch();
  }
  async function closeAs(status: "skipped" | "completed") {
    await write(step, status);
    setOpen(false);
  }
  async function next() {
    if (!definition) return;
    if (step === definition.steps.length - 1) return closeAs("completed");
    const nextStep = step + 1;
    setStep(nextStep);
    await write(nextStep, "started");
  }
  async function replay() {
    const refreshed = await refetch();
    if (!refreshed.data || !roleForSurface(surface, refreshed.data.roles as TourRole[])) return;
    setStep(0);
    setOpen(true);
    await write(0, "started");
  }

  return <>
    <Button className="tour-trigger" variant="ghost" aria-label={`Take the ${definition.label} tour`} onClick={() => void replay()}><CircleHelp /><span>{compact ? "Tour" : "Take a tour"}</span></Button>
    {open && <div className="tour-backdrop" role="presentation">
      <div ref={dialog} className="tour-dialog" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-description" tabIndex={-1}>
        <div className="tour-heading"><p className="ops-panel-kicker">{definition.label} · {step + 1} of {definition.steps.length}</p><Button variant="ghost" size="icon" aria-label="Skip tour" onClick={() => void closeAs("skipped")}><X /></Button></div>
        <h2 id="tour-title">{current.title}</h2>
        <p id="tour-description">{current.body}</p>
        <dl className="tour-details"><div><dt>Who can see it</dt><dd>{current.visibility}</dd></div>{current.review && <div><dt>Review or consent</dt><dd>{current.review}</dd></div>}</dl>
        {current.href && <Link className="tour-link" to={current.href}>{current.linkLabel ?? "Open page"}</Link>}
        <div className="tour-actions">
          <Button variant="ghost" onClick={() => void closeAs("skipped")}>Skip</Button>
          <Button variant="outline" className="ops-outline" disabled={step === 0} onClick={() => { const previous = Math.max(0, step - 1); setStep(previous); void write(previous, "started"); }}>Back</Button>
          <Button onClick={() => void next()}>{step === definition.steps.length - 1 ? "Finish" : "Next"}</Button>
        </div>
      </div>
    </div>}
  </>;
}