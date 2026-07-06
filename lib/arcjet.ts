import arcjet, {
  detectBot,
  shield,
  slidingWindow,
  type ArcjetDecision,
  type ArcjetNextRequest,
} from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [shield({ mode: "LIVE" })],
});

export const publicReadAj = aj
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    })
  )
  .withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 120,
    })
  );

export const authAj = aj
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 10,
    })
  );

export const apiAj = aj
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 60,
    })
  );

export const writeAj = aj
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 20,
    })
  );

export function arcjetResponse(decision: ArcjetDecision) {
  if (decision.isErrored()) {
    console.error("Arcjet decision errored", decision);
    return null;
  }

  if (!decision.isDenied()) {
    return null;
  }

  if (decision.reason.isRateLimit()) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function protect(
  request: ArcjetNextRequest,
  client = apiAj
) {
  return arcjetResponse(await client.protect(request));
}

export default aj;
