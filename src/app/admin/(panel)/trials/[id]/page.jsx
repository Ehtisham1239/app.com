"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, CheckCircle2, Clock, GraduationCap, Loader2, Mail, MessageCircle, Phone, Save, Send, Trash2 } from "lucide-react";
import { useAccess } from "@/lib/admin/access";
import { db, fromLocalInput, notifyError, toLocalInput, useLoad } from "@/lib/admin/db";
import { AGE_BANDS, CURRENCIES, LEVELS, TEACHER_PREFS, TIME_SLOTS, TRIAL_STATUSES, TRIAL_TRANSITIONS, labelFor } from "@/lib/constants";
import { formatDateTime, toMinor, whatsappLink } from "@/lib/format";
import { Badge, Card, ConfirmButton, ErrorState, Field, Loading, PageHeader, StatusBadge, When } from "@/components/admin/ui";

const SELECT = "*, courses(id, title), teachers(id, display_name), profiles(id, full_name), students!trial_applications_student_id_fkey(student_code, full_name)";
const ACTION_LABEL = { reviewed: "Mark reviewed", completed: "Trial done", no_show: "No-show", cancelled: "Cancel request", reviewed_again: "Re-open" };

function localTime(iso, tz) {
  if (!iso || !tz) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));
  } catch {
    return "";
  }
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3 border-b border-line py-2.5 text-[0.93rem] last:border-0">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="min-w-0 text-ink">{children || <span className="text-ink-faint">—</span>}</dd>
    </div>
  );
}

function ScheduleCard({ trial, onDone, canEdit }) {
  const teachers = useLoad(() => db().from("teachers").select("id, display_name, gender, shift").eq("is_active", true).is("deleted_at", null).order("display_name"), []);
  const [teacherId, setTeacherId] = useState(trial.assigned_teacher_id || "");
  const [at, setAt] = useState(toLocalInput(trial.trial_at));
  const [duration, setDuration] = useState(trial.trial_duration_min || 30);
  const [link, setLink] = useState(trial.meeting_url || "");
  const [busy, setBusy] = useState(false);
  const iso = fromLocalInput(at);
  const open = ["new", "reviewed", "scheduled", "no_show"].includes(trial.status);
  const save = async () => {
    if (!iso) return toast.error("Choose the date and time of the trial class.");
    setBusy(true);
    const { error } = await db().rpc("schedule_trial", { p_trial_id: trial.id, p_teacher_id: teacherId || null, p_trial_at: iso, p_duration_min: Number(duration) || 30, p_meeting_url: link || null });
    setBusy(false);
    if (error) return notifyError(error);
    toast.success("Trial class scheduled");
    onDone();
  };
  return (
    <Card title={["new", "reviewed"].includes(trial.status) ? "Schedule the trial class" : "Trial class"}>
      {!open ? (
        <div className="space-y-1 text-sm text-ink-soft">
          <p>{trial.trial_at ? formatDateTime(trial.trial_at) : "No trial time recorded."}</p>
          {trial.teachers && <p>Teacher: {trial.teachers.display_name}</p>}
        </div>
      ) : (
        <fieldset disabled={!canEdit} className="space-y-4">
          <Field label="Teacher">
            <select className="adm-input" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
              <option value="">— Choose later —</option>
              {(teachers.data || []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.display_name} ({t.gender}
                  {t.shift ? `, ${t.shift}` : ""})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date and time (your time)" hint={iso ? `For the family: ${localTime(iso, trial.timezone)} (${trial.timezone})` : `Family time zone: ${trial.timezone}`}>
            <input type="datetime-local" className="adm-input" value={at} onChange={(e) => setAt(e.target.value)} />
          </Field>
          <div className="grid grid-cols-[6rem_1fr] gap-3">
            <Field label="Minutes">
              <input type="number" min={15} max={120} className="adm-input" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </Field>
            <Field label="Class link">
              <input className="adm-input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Zoom / Meet link" />
            </Field>
          </div>
          <button type="button" className="btn btn-primary w-full" onClick={save} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <CalendarClock className="size-4" />} {trial.status === "scheduled" ? "Update trial class" : "Schedule trial"}
          </button>
        </fieldset>
      )}
    </Card>
  );
}

function EnrolCard({ trial, onDone }) {
  const courses = useLoad(() => db().from("courses").select("id, title").is("deleted_at", null).order("sort_order"), []);
  const plans = useLoad(() => db().from("pricing_plans").select("id, name, classes_per_week, pricing_plan_prices(currency, amount_minor)").is("deleted_at", null).order("sort_order"), []);
  const [courseId, setCourseId] = useState(trial.course_id || "");
  const [planId, setPlanId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [fee, setFee] = useState("");
  const [start, setStart] = useState(new Date().toLocaleDateString("en-CA"));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const plan = (plans.data || []).find((p) => p.id === planId);
    const price = plan?.pricing_plan_prices?.find((p) => p.currency === currency);
    if (price) setFee(String(price.amount_minor / 100));
  }, [planId, currency, plans.data]);
  const enrol = async () => {
    if (!courseId) return toast.error("Choose the course.");
    setBusy(true);
    const { error } = await db().rpc("convert_trial_to_student", {
      p_trial_id: trial.id,
      payload: { course_id: courseId, plan_id: planId || null, currency, fee_amount_minor: fee === "" ? null : toMinor(fee), start_date: start },
    });
    setBusy(false);
    if (error) return notifyError(error);
    toast.success("Marked as enrolled");
    onDone();
  };
  return (
    <Card title="Enrol after the trial">
      <div className="space-y-4">
        <Field label="Course">
          <select className="adm-input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">— Choose —</option>
            {(courses.data || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Package">
          <select className="adm-input" value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="">— Choose —</option>
            {(plans.data || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.classes_per_week}/week
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-[6.5rem_1fr] gap-3">
          <Field label="Currency">
            <select className="adm-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Monthly fee">
            <input className="adm-input" inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0" />
          </Field>
        </div>
        <Field label="Start date">
          <input type="date" className="adm-input" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <button type="button" className="btn btn-gold w-full" onClick={enrol} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <GraduationCap className="size-4" />} Mark as enrolled
        </button>
      </div>
    </Card>
  );
}

function Notes({ trialId, userId }) {
  const notes = useLoad(() => db().from("trial_notes").select("id, body, created_at, author_id, profiles(full_name)").eq("trial_id", trialId).order("created_at", { ascending: true }), [trialId]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const add = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    const { error } = await db().from("trial_notes").insert({ trial_id: trialId, body: text.trim(), author_id: userId });
    setBusy(false);
    if (error) return notifyError(error);
    setText("");
    notes.reload();
  };
  return (
    <Card title="Notes">
      {(notes.data || []).length === 0 ? (
        <p className="text-sm text-ink-faint">No notes yet. Record calls, WhatsApp chats and decisions here.</p>
      ) : (
        <ul className="space-y-3">
          {notes.data.map((n) => (
            <li key={n.id} className="rounded-xl bg-paper px-4 py-3">
              <p className="whitespace-pre-wrap text-[0.93rem] text-ink">{n.body}</p>
              <p className="mt-1 text-xs text-ink-faint">
                {n.profiles?.full_name || "Admin"} · <When value={n.created_at} />
              </p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={add} className="mt-4 flex gap-2">
        <textarea className="adm-input" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a note…" aria-label="New note" />
        <button type="submit" className="btn btn-primary btn-sm self-end" disabled={busy || !text.trim()} aria-label="Add note">
          <Send className="size-4" />
        </button>
      </form>
    </Card>
  );
}

function History({ trialId, version }) {
  const hist = useLoad(() => db().from("trial_history").select("id, from_status, to_status, note, created_at, profiles(full_name)").eq("trial_id", trialId).order("created_at", { ascending: false }), [trialId, version]);
  return (
    <Card title="History">
      <ol className="space-y-3">
        {(hist.data || []).map((h) => (
          <li key={h.id} className="flex gap-3 text-sm">
            <Clock className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
            <div>
              <p className="text-ink">
                {h.from_status ? (
                  <>
                    {labelFor(TRIAL_STATUSES, h.from_status)} → <strong>{labelFor(TRIAL_STATUSES, h.to_status)}</strong>
                  </>
                ) : (
                  <strong>{labelFor(TRIAL_STATUSES, h.to_status)}</strong>
                )}
                {h.note && <span className="text-ink-soft"> — {h.note}</span>}
              </p>
              <p className="text-xs text-ink-faint">
                {h.profiles?.full_name || "Website"} · {formatDateTime(h.created_at)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export default function TrialPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { can, access } = useAccess();
  const trial = useLoad(() => db().from("trial_applications").select(SELECT).eq("id", id).maybeSingle(), [id]);
  const staff = useLoad(() => db().from("profiles").select("id, full_name, role").eq("is_active", true).order("full_name"), []);
  const [outcome, setOutcome] = useState("");
  const [busy, setBusy] = useState("");
  useEffect(() => setOutcome(trial.data?.outcome_note || ""), [trial.data?.outcome_note]);

  if (trial.loading && !trial.data) return <Loading rows={8} />;
  if (trial.error) return <ErrorState error={trial.error} onRetry={trial.reload} />;
  const t = trial.data;
  if (!t || t.deleted_at) return <PageHeader title="Request not found" back={{ href: "/admin/trials", label: "Free trials" }} />;
  const canEdit = can("trials:update");
  const wa = whatsappLink(t.phone, `Assalamu alaikum${t.guardian_name ? ` ${t.guardian_name}` : ""}, this is Online Quran College about the free trial for ${t.learner_name} (${t.reference}).`);
  const transitions = (TRIAL_TRANSITIONS[t.status] || []).filter((s) => !["scheduled", "enrolled"].includes(s));

  const update = async (patch, label) => {
    setBusy(label);
    const { error } = await db().from("trial_applications").update(patch).eq("id", t.id);
    setBusy("");
    if (error) return notifyError(error);
    toast.success("Updated");
    trial.reload();
  };

  return (
    <>
      <PageHeader
        title={t.learner_name}
        back={{ href: "/admin/trials", label: "Free trials" }}
        actions={
          canEdit &&
          transitions.map((s) => (
            <button key={s} type="button" disabled={!!busy} onClick={() => update({ status: s, outcome_note: outcome || null }, s)} className={s === "cancelled" || s === "no_show" ? "btn btn-outline btn-sm" : "btn btn-primary btn-sm"}>
              {busy === s && <Loader2 className="size-4 animate-spin" />} {t.status === "cancelled" && s === "reviewed" ? "Re-open" : ACTION_LABEL[s] || labelFor(TRIAL_STATUSES, s)}
            </button>
          ))
        }
      >
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-faint">
          <StatusBadge list={TRIAL_STATUSES} value={t.status} />
          <span>{t.reference}</span>
          <span>·</span>
          <span>
            Requested <When value={t.created_at} />
          </span>
          {t.duplicate_of_id && (
            <Link href={`/admin/trials/${t.duplicate_of_id}`}>
              <Badge tone="amber">Possible repeat — see earlier request</Badge>
            </Link>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-6">
          <Card title="Contact">
            <dl>
              <Row label="Parent / guardian">{t.guardian_name}</Row>
              <Row label="Email">
                <a href={`mailto:${t.email}`} className="text-leaf-700 hover:underline">
                  {t.email}
                </a>
              </Row>
              <Row label="Phone">
                {t.phone} {t.phone_is_whatsapp && <Badge tone="green">WhatsApp</Badge>}
              </Row>
              <Row label="Location">{[t.city, t.country].filter(Boolean).join(", ")}</Row>
              <Row label="Family’s time now">
                {localTime(new Date().toISOString(), t.timezone)} <span className="text-ink-faint">({t.timezone})</span>
              </Row>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
              )}
              <a href={`tel:${t.phone}`} className="btn btn-outline btn-sm">
                <Phone className="size-4" /> Call
              </a>
              <a href={`mailto:${t.email}?subject=${encodeURIComponent(`Your free trial at Online Quran College (${t.reference})`)}`} className="btn btn-outline btn-sm">
                <Mail className="size-4" /> Email
              </a>
            </div>
          </Card>

          <Card title="Learner and preferences">
            <dl>
              <Row label="Age group">{labelFor(AGE_BANDS, t.age_band)}</Row>
              <Row label="Learner gender">{t.learner_gender ? (t.learner_gender === "female" ? "Female" : "Male") : null}</Row>
              <Row label="Course">{t.courses?.title || "Not chosen — assess in the trial"}</Row>
              <Row label="Level">{labelFor(LEVELS, t.level)}</Row>
              <Row label="Teacher">{labelFor(TEACHER_PREFS, t.teacher_gender_pref)}</Row>
              <Row label="Language">{t.teaching_language}</Row>
              <Row label="Preferred days">{t.preferred_days?.join(", ")}</Row>
              <Row label="Preferred times">{t.preferred_times?.map((x) => labelFor(TIME_SLOTS, x)).join(", ")}</Row>
              <Row label="Notes from family">{t.notes && <span className="whitespace-pre-wrap">{t.notes}</span>}</Row>
              <Row label="Source">
                {t.source}
                {t.utm && Object.keys(t.utm).length > 0 && <span className="text-ink-faint"> · {Object.entries(t.utm).map(([k, v]) => `${k}=${v}`).join(" ")}</span>}
              </Row>
              <Row label="Consent">
                Given {formatDateTime(t.consent_at)} {t.marketing_opt_in && <Badge tone="blue">Happy to receive news</Badge>}
              </Row>
            </dl>
          </Card>

          <Notes trialId={t.id} userId={access?.id} />
          <History trialId={t.id} version={t.version} />
        </div>

        <aside className="space-y-6">
          <ScheduleCard key={`${t.id}-${t.version}`} trial={t} onDone={trial.reload} canEdit={canEdit} />

          {t.student_id ? (
            <Card title="Enrolled">
              <p className="flex items-center gap-2 text-sm text-ink">
                <CheckCircle2 className="size-5 text-leaf-600" aria-hidden="true" /> {t.students?.full_name} — student {t.students?.student_code}
              </p>
            </Card>
          ) : (
            ["scheduled", "completed"].includes(t.status) && (can("trials:convert") || can("enrollments:create")) && <EnrolCard trial={t} onDone={trial.reload} />
          )}

          <Card title="Handled by">
            <fieldset disabled={!canEdit} className="space-y-4">
              <Field label="Admin responsible">
                <select className="adm-input" value={t.assigned_to || ""} onChange={(e) => update({ assigned_to: e.target.value || null }, "assign")}>
                  <option value="">— Nobody yet —</option>
                  {(staff.data || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Outcome / next step" hint="Saved with the next status change, or click Save note.">
                <textarea className="adm-input" rows={3} value={outcome} onChange={(e) => setOutcome(e.target.value)} />
              </Field>
              <button type="button" className="btn btn-outline btn-sm" disabled={busy === "note" || outcome === (t.outcome_note || "")} onClick={() => update({ outcome_note: outcome || null }, "note")}>
                <Save className="size-4" /> Save note
              </button>
            </fieldset>
          </Card>

          {can("trials:delete") && (
            <ConfirmButton
              title="Delete this request?"
              message="Use this only for spam or test entries. The request will be hidden from the admin panel."
              confirmLabel="Delete"
              className="btn btn-ghost w-full text-rose-700"
              onConfirm={async () => {
                const { error } = await db().from("trial_applications").update({ deleted_at: new Date().toISOString() }).eq("id", t.id);
                if (error) return notifyError(error);
                toast.success("Deleted");
                router.replace("/admin/trials");
              }}
            >
              <Trash2 className="size-4" /> Delete request
            </ConfirmButton>
          )}
        </aside>
      </div>
    </>
  );
}
