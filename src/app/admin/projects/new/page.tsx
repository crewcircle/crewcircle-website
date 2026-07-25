"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Terminal,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

type Step = "details" | "pricing" | "confirm" | "executing";

interface FormState {
  projectId: string;
  name: string;
  description: string;
  priceCents: number;
}

interface JobState {
  jobId: string | null;
  status: string;
  outputLog: string;
  error: string | null;
}

const INITIAL_FORM: FormState = {
  projectId: "",
  name: "",
  description: "",
  priceCents: 19900,
};

const STEPS: { key: Step; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "pricing", label: "Pricing" },
  { key: "confirm", label: "Confirm" },
  { key: "executing", label: "Provision" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [job, setJob] = useState<JobState>({
    jobId: null,
    status: "idle",
    outputLog: "",
    error: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  // ---- Validation ----
  const validateDetails = useCallback((): boolean => {
    if (!form.projectId) {
      setValidationError("Project ID is required");
      return false;
    }
    if (!/^[a-z][a-z0-9-]+$/.test(form.projectId)) {
      setValidationError(
        "Project ID must be lowercase letters, numbers, and hyphens"
      );
      return false;
    }
    if (!form.name) {
      setValidationError("Project name is required");
      return false;
    }
    setValidationError(null);
    return true;
  }, [form]);

  const validatePricing = useCallback((): boolean => {
    if (form.priceCents < 0) {
      setValidationError("Price cannot be negative");
      return false;
    }
    setValidationError(null);
    return true;
  }, [form]);

  // ---- Navigation ----
  const goNext = () => {
    if (step === "details" && !validateDetails()) return;
    if (step === "pricing" && !validatePricing()) return;
    if (step === "confirm") return executeProvision();

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) setStep(STEPS[nextIndex].key);
  };

  const goBack = () => {
    if (step === "executing") return; // can't go back during execution
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setStep(STEPS[prevIndex].key);
  };

  // ---- Execution ----
  const executeProvision = async () => {
    setStep("executing");
    setSubmitting(true);
    setJob({ jobId: null, status: "running", outputLog: "", error: null });

    try {
      const res = await fetch("/api/admin/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: form.projectId,
          name: form.name,
          description: form.description,
          priceCents: form.priceCents,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setJob((j) => ({
          ...j,
          status: "failed",
          error: (err as { error?: string }).error ?? "Provisioning failed",
        }));
        setSubmitting(false);
        return;
      }

      const { jobId } = await res.json();
      setJob((j) => ({ ...j, jobId }));

      // Poll for completion
      const poll = setInterval(async () => {
        const pollRes = await fetch(
          `/api/admin/provision?jobId=${jobId}`
        );
        if (!pollRes.ok) return;

        const pollData = await pollRes.json();
        setJob({
          jobId,
          status: pollData.status,
          outputLog: pollData.output_log ?? "",
          error: pollData.error_message ?? null,
        });

        if (
          pollData.status === "completed" ||
          pollData.status === "failed"
        ) {
          clearInterval(poll);
          setSubmitting(false);
        }
      }, 2000);
    } catch (err) {
      setJob((j) => ({
        ...j,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
      setSubmitting(false);
    }
  };

  // ---- Formatting ----
  const formatAud = (cents: number) =>
    `A$${(cents / 100).toFixed(2)}/mo`;

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          New Project
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Provision a new CrewCircle project with Supabase, Stripe, GitHub,
          and DNS.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                i < currentStepIndex
                  ? "bg-green-100 text-green-700"
                  : i === currentStepIndex
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < currentStepIndex ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-sm ${
                i <= currentStepIndex
                  ? "font-medium text-gray-900"
                  : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {validationError}
        </div>
      )}

      {/* Step content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {step === "details" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project ID
              </label>
              <input
                type="text"
                value={form.projectId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, projectId: e.target.value }))
                }
                placeholder="my-new-app"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Lowercase, hyphens, no spaces. Used for GitHub repo and DNS.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="My New App"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What does this project do?"
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {step === "pricing" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Price (AUD)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-gray-500">$</span>
                <input
                  type="number"
                  value={form.priceCents / 100}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priceCents: Math.round(
                        parseFloat(e.target.value || "0") * 100
                      ),
                    }))
                  }
                  min="0"
                  step="0.01"
                  className="block w-32 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {formatAud(form.priceCents)} ({(form.priceCents / 100).toFixed(2)} AUD/month)
              </p>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Price (cents)</span>
                <span className="font-medium text-gray-900">
                  {form.priceCents}¢
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">Monthly</span>
                <span className="font-medium text-gray-900">
                  {formatAud(form.priceCents)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">Annual</span>
                <span className="font-medium text-gray-900">
                  {formatAud(form.priceCents * 12)}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Review and confirm
            </h3>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Project ID</span>
                <span className="font-mono font-medium text-gray-900">
                  {form.projectId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Name</span>
                <span className="font-medium text-gray-900">
                  {form.name}
                </span>
              </div>
              {form.description && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Description</span>
                  <span className="font-medium text-gray-900 max-w-[60%] text-right">
                    {form.description}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price</span>
                <span className="font-medium text-gray-900">
                  {formatAud(form.priceCents)}
                </span>
              </div>
              <hr className="border-gray-200" />
              <div className="text-xs text-gray-400 space-y-1">
                <p>
                  This will create:
                </p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Pulumi stack + ESC environment</li>
                  <li>Supabase project</li>
                  <li>Stripe product</li>
                  <li>GitHub private repo</li>
                  <li>Cloudflare DNS record</li>
                  <li>Doppler project</li>
                  <li>Sentry project</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Provisioning typically takes 60-90 seconds (Supabase is the slowest).
              You can monitor progress on the next screen.
            </p>
          </div>
        )}

        {step === "executing" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {job.status === "running" && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Provisioning {form.name}...
                  </span>
                </>
              )}
              {job.status === "completed" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Provisioned successfully!
                  </span>
                </>
              )}
              {job.status === "failed" && (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    Provisioning failed
                  </span>
                </>
              )}
            </div>

            {job.error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {job.error}
              </div>
            )}

            {/* Log output */}
            {job.outputLog && (
              <div className="rounded-md border border-gray-200 bg-gray-900 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
                  <Terminal className="h-3 w-3" />
                  Output
                </div>
                <pre className="max-h-64 overflow-auto text-xs text-green-400 whitespace-pre-wrap font-mono">
                  {job.outputLog}
                </pre>
              </div>
            )}

            {job.status === "completed" && (
              <button
                onClick={() =>
                  router.push(`/admin/projects/${form.projectId}`)
                }
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                View Project
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {job.status === "failed" && (
              <button
                onClick={() => {
                  setStep("confirm");
                  setJob({
                    jobId: null,
                    status: "idle",
                    outputLog: "",
                    error: null,
                  });
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {step !== "executing" && (
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === "details"}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={goNext}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {step === "confirm" ? (
              <>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Provision Project
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
