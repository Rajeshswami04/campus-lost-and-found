"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, ImagePlus, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

const categories = [
  "electronics",
  "documents",
  "id_card",
  "wallet",
  "keys",
  "clothing",
  "accessories",
  "laptop",
  "books",
  "bottle",
  "bag",
  "other",
];

const initialForm = {
  title: "",
  category: "",
  description: "",
  color: "",
  brand: "",
  lostLocation: "",
  lostDate: "",
  proofHints: "",
};

export default function LostPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isDisabled =
    !form.title.trim() ||
    !form.category ||
    !form.description.trim() ||
    !form.lostLocation.trim() ||
    !form.lostDate;

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      setPreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setUploadedImageUrl("");
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      let imageUrl = uploadedImageUrl;

      if (selectedImage && !imageUrl) {
        const imageData = new FormData();
        imageData.append("file", selectedImage);

        const uploadResponse = await axios.post("/api/upload", imageData);
        imageUrl = uploadResponse.data.secure_url;
        setUploadedImageUrl(imageUrl);
      }

      const response = await axios.post("/api/users/lost", {
        ...form,
        image: imageUrl,
      });

      toast.success(response.data.message || "Lost item report submitted");
      setForm(initialForm);
      setSelectedImage(null);
      setPreviewUrl("");
      setUploadedImageUrl("");
      event.currentTarget.reset();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to submit lost item report"
        : "Failed to submit lost item report";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Lost Report
            </p>
            <h1 className="mt-3 text-3xl font-bold">Report a lost item</h1>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Fill in the details as clearly as possible so the admin team can
              review the report and help match it with found items.
            </p>

            <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 size-5 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Admin approval flow
                  </p>
                  <p className="mt-1 text-sm leading-6 text-zinc-300">
                    Reports should stay under review before they are treated as
                    active recovery cases.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-sm text-zinc-400">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="font-medium text-white">What to include</p>
                <p className="mt-2 leading-6">
                  Add identifying details like color, brand, item code, and any
                  proof hints only the owner would know.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="font-medium text-white">Image support</p>
                <p className="mt-2 leading-6">
                  Upload a clear image (make collage or all sides) of the lost item so admin can review it
                  and verify possible matches faster.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/20">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="itemImage"
                    className="mb-2 block text-sm font-medium"
                  >
                    Item image
                  </label>
                  <label
                    htmlFor="itemImage"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-800/70 px-4 py-6 text-center transition hover:border-blue-500 hover:bg-zinc-800"
                  >
                    <ImagePlus className="size-6 text-blue-400" />
                    <span className="mt-3 text-sm font-medium text-white">
                      Choose an item image
                    </span>
                    <span className="mt-1 text-xs text-zinc-500">
                      PNG, JPG, or WEBP
                    </span>
                  </label>
                  <input
                    id="itemImage"
                    name="itemImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                      <div className="relative aspect-4/3 overflow-hidden rounded-lg">
                        <Image
                          src={previewUrl}
                          alt="Selected item preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <p className="mt-3 text-xs text-zinc-500">
                        {selectedImage?.name}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="title" className="mb-2 block text-sm font-medium">
                    Item title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Black backpack"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white placeholder-zinc-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="lostDate" className="mb-2 block text-sm font-medium">
                    Lost date
                  </label>
                  <input
                    id="lostDate"
                    name="lostDate"
                    type="date"
                    value={form.lostDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="color" className="mb-2 block text-sm font-medium">
                    Color
                  </label>
                  <input
                    id="color"
                    name="color"
                    type="text"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="Black"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white placeholder-zinc-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="mb-2 block text-sm font-medium">
                    Brand
                  </label>
                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="Wildcraft"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white placeholder-zinc-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="lostLocation"
                    className="mb-2 block text-sm font-medium"
                  >
                    Last seen location
                  </label>
                  <input
                    id="lostLocation"
                    name="lostLocation"
                    type="text"
                    value={form.lostLocation}
                    onChange={handleChange}
                    placeholder="Library entrance, Main Block"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white placeholder-zinc-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe the item, what was inside it, and any marks that make it easy to identify."
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white placeholder-zinc-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="proofHints"
                    className="mb-2 block text-sm font-medium"
                  >
                    Proof hints
                  </label>
                  <textarea
                    id="proofHints"
                    name="proofHints"
                    value={form.proofHints}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Example: one side pocket zip is broken, contains a notebook with initials, charger brand, etc."
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white placeholder-zinc-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Keep this limited to clues that can help verify the real owner.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-zinc-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-400">
                  {uploadedImageUrl
                    ? "Image uploaded successfully and ready to attach to the report."
                    : "You can submit with or without an image for now."}
                </p>
                <button
                  type="submit"
                  disabled={isDisabled || loading}
                  className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${
                    isDisabled || loading
                      ? "cursor-not-allowed bg-zinc-700 text-zinc-500"
                      : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]"
                  }`}
                >
                  {loading ? "Submitting..." : "Submit lost item report"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
