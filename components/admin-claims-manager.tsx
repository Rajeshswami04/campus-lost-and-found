"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PersonSummary = {
  _id: string;
  username?: string;
  ID?: string;
  email?: string;
};

type FoundItemSummary = {
  _id: string;
  title: string;
  category?: string;
  foundLocation?: string;
  foundDate?: string | Date;
  status?: string;
  verificationQuestions?: string[];
};

type ClaimAnswer = {
  question: string;
  answer: string;
};

type ClaimRecord = {
  _id: string;
  status: string;
  createdAt: string | Date;
  reviewNote?: string;
  message?: string;
  answers?: ClaimAnswer[];
  claimant?: PersonSummary | null;
  foundItem?: FoundItemSummary | null;
  reviewedBy?: PersonSummary | null;
  approvedAt?: string | Date;
  rejectedAt?: string | Date;
};

function formatDate(value?: string | Date) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "approved":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "rejected":
      return "border-rose-500/30 bg-rose-500/10 text-rose-300";
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }
}

export default function AdminClaimsManager() {
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const stats = useMemo(() => {
    const pending = claims.filter((claim) => claim.status === "pending").length;
    const approved = claims.filter((claim) => claim.status === "approved").length;
    const rejected = claims.filter((claim) => claim.status === "rejected").length;

    return { pending, approved, rejected };
  }, [claims]);

  useEffect(() => {
    async function loadClaims() {
      try {
        const response = await fetch("/api/admin/claims", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load claims");
        }

        setClaims(payload.claims || []);
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Unable to load claims");
      } finally {
        setLoading(false);
      }
    }

    loadClaims();
  }, []);

  async function reviewClaim(claimId: string, status: "approved" | "rejected") {
    try {
      setProcessingId(claimId);
      const response = await fetch(`/api/admin/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewNote: reviewNotes[claimId] || "",
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update claim status");
      }

      setClaims((current) =>
        current.map((claim) =>
          claim._id === claimId
            ? {
                ...claim,
                status,
                reviewNote: reviewNotes[claimId] || claim.reviewNote || "",
              }
            : claim
        )
      );

      toast.success(`Claim ${status === "approved" ? "approved" : "rejected"}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to update claim");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-zinc-400">Pending review</CardDescription>
            <CardTitle className="text-3xl font-black text-white">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-zinc-400">Approved</CardDescription>
            <CardTitle className="text-3xl font-black text-white">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-zinc-400">Rejected</CardDescription>
            <CardTitle className="text-3xl font-black text-white">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
          Loading claims...
        </div>
      ) : claims.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-400">
          No claims have been submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => {
            const foundItem = claim.foundItem;
            const verificationQuestions = foundItem?.verificationQuestions || [];
            const submittedAnswers = claim.answers || [];

            return (
              <Card key={claim._id} className="border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
                <CardHeader className="space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-white">
                        {foundItem?.title || "Claimed item"}
                      </CardTitle>
                      <CardDescription className="mt-2 space-y-1 text-zinc-400">
                        <p>
                          Claimed by {claim.claimant?.username || claim.claimant?.email || "Unknown user"}
                        </p>
                        <p>
                          Submitted {formatDate(claim.createdAt)}
                        </p>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusBadgeClass(claim.status)}>{claim.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        <Clock3 className="size-4" /> Item details
                      </div>
                      <div className="space-y-2 text-sm text-zinc-300">
                        <p>
                          <span className="text-zinc-500">Category:</span> {foundItem?.category || "—"}
                        </p>
                        <p>
                          <span className="text-zinc-500">Location:</span> {foundItem?.foundLocation || "—"}
                        </p>
                        <p>
                          <span className="text-zinc-500">Status:</span> {foundItem?.status || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        <CheckCircle2 className="size-4" /> Verification questions
                      </div>
                      {verificationQuestions.length > 0 ? (
                        <ul className="space-y-2 text-sm text-zinc-300">
                          {verificationQuestions.map((question, index) => (
                            <li key={`${question}-${index}`} className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                              {question}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-zinc-400">No verification questions were recorded for this item.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      <CheckCircle2 className="size-4" /> Claim answers
                    </div>
                    {submittedAnswers.length > 0 ? (
                      <div className="space-y-3">
                        {submittedAnswers.map((entry, index) => (
                          <div key={`${entry.question}-${index}`} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                            <p className="text-sm font-semibold text-white">{entry.question}</p>
                            <p className="mt-1 text-sm text-zinc-400">{entry.answer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400">No answer details were submitted.</p>
                    )}
                  </div>

                  {claim.message ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                      <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Claim message
                      </div>
                      <p className="text-sm text-zinc-300">{claim.message}</p>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Review note
                    </label>
                    <textarea
                      value={reviewNotes[claim._id] ?? claim.reviewNote ?? ""}
                      onChange={(event) =>
                        setReviewNotes((current) => ({
                          ...current,
                          [claim._id]: event.target.value,
                        }))
                      }
                      className="min-h-24 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none ring-0"
                      placeholder="Add a short note for this decision"
                    />
                  </div>

                  {claim.status === "pending" ? (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => reviewClaim(claim._id, "approved")}
                        disabled={processingId === claim._id}
                        className="bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        {processingId === claim._id ? "Processing..." : "Approve claim"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => reviewClaim(claim._id, "rejected")}
                        disabled={processingId === claim._id}
                        className="border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
                      >
                        {processingId === claim._id ? "Processing..." : "Reject claim"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-400">
                      {claim.status === "approved" ? (
                        <CheckCircle2 className="size-4 text-emerald-400" />
                      ) : (
                        <XCircle className="size-4 text-rose-400" />
                      )}
                      This claim was already {claim.status}.
                      {claim.reviewNote ? <span className="text-zinc-300">Note: {claim.reviewNote}</span> : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
