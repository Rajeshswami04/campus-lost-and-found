import { NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadedImage = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "lost-found-items",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error("Cloudinary upload failed"));
              return;
            }

            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        )
        .end(buffer);
    });

    return NextResponse.json(uploadedImage, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload image";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
