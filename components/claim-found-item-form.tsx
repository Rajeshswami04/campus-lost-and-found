"use client";
import { FormEvent, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

type Props = {
  foundItemId: string;
  verificationQuestions: string[];
  itemStatus: string;
};

export default function ClaimFoundItemForm({
  foundItemId,
  verificationQuestions,
  itemStatus,
}: Props) {
  const [answers, setAnswers] = useState(
    verificationQuestions.map((question) => ({ question, answer: "" }))
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isClaimable = ["available", "under_verification"].includes(itemStatus);
  const isDisabled =
    loading ||
    !isClaimable ||
    verificationQuestions.length === 0 ||
    answers.some((entry) => !entry.answer.trim());

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((current) =>
      current.map((entry, currentIndex) =>
        currentIndex === index ? { ...entry, answer: value } : entry
      )
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const response = await axios.post("/api/users/claims", {
        foundItemId,
        answers,
        message,
      });

      toast.success(response.data.message || "Claim submitted");
      setMessage("");
      setAnswers(verificationQuestions.map((question) => ({ question, answer: "" })));
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to submit claim"
        : "Failed to submit claim";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isClaimable) {
    return (
      <p className="text-sm text-zinc-400">
        This item is not currently open for claims.
      </p>
    );
  }

  if (verificationQuestions.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        Claims are disabled for this item because there are no verification questions.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-800 p-4">
      <h3 className="text-lg font-semibold text-white">Claim this item</h3>
      {answers.map((entry, index) => (
        <div key={entry.question} className="space-y-2">
          <label className="block text-sm font-medium text-white">{entry.question}</label>
          <textarea
            value={entry.answer}
            onChange={(event) => handleAnswerChange(index, event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your answer"
          />
        </div>
      ))}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Extra message</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any extra details you want to add"
        />
      </div>
      <button
        type="submit"
        disabled={isDisabled}
        title="Submit claim"
        className={`rounded-lg px-4 py-2 text-sm font-semibold ${
          isDisabled
            ? "cursor-not-allowed bg-zinc-700 text-zinc-500"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {loading ? "Submitting..." : "Submit claim"}
      </button>
    </form>
  );
}
