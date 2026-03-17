import Vapi from "@vapi-ai/web";

if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_VAPI_PUBLIC_KEY is not defined!");
}

export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
