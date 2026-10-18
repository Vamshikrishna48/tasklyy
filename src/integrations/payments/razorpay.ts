import { getApiUrl } from "@/lib/api";

type RazorpayHandler = (response: any) => void;

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: RazorpayHandler;
  prefill?: { email?: string; contact?: string; name?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on?: (event: string, callback: (response: any) => void) => void;
    };
  }
}

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Razorpay SDK failed to load.");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Opens the Razorpay checkout modal directly.
 * Attempts server-side order generation first if configured, and handles failures gracefully.
 */
export async function openRazorpayCheckout(
  amountInRupees: number,
  jobTitle: string,
  userEmail: string | null,
  onSuccess: (response: any) => void,
  onFailure: (reason?: string) => void,
  onCancel?: () => void,
  userPhone?: string | null,
  userName?: string | null
) {
  // Ensure amount is a clean integer and at least 1 Rupee (100 paise)
  const sanitizedAmount = Math.max(1, Math.round(Number(amountInRupees) || 1));
  const sanitizedEmail = (userEmail && userEmail.trim()) ? userEmail.trim() : "";
  const sanitizedPhone = (userPhone && userPhone.trim()) ? userPhone.trim() : "";
  const sanitizedName = (userName && userName.trim()) ? userName.trim() : "";

  // Launch Razorpay standard flow directly
  const isLoaded = await loadRazorpay();
  if (!isLoaded || !window.Razorpay) {
    console.error("Razorpay SDK script not available.");
    onFailure("Razorpay SDK script could not be loaded.");
    return;
  }

  let key = null;
  let orderId: string | undefined = undefined;

  // 1. Try creating an official order via backend first
  try {
    const orderRes = await fetch(getApiUrl("/api/create-razorpay-order"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: sanitizedAmount, currency: "INR" })
    });
    if (orderRes.ok) {
      const orderData = await orderRes.json();
      if (orderData && orderData.success && orderData.order_id) {
        orderId = orderData.order_id;
        if (orderData.key_id) key = orderData.key_id;
        console.log("Successfully generated Razorpay order ID:", orderId);
      }
    }
  } catch (err) {
    console.warn("Server order creation unavailable, checking direct keys:", err);
  }

  // 2. Try fetching dynamically from the backend if key not set
  if (!key) {
    try {
      const response = await fetch(getApiUrl("/api/get-razorpay-key"));
      const data = await response.json();
      if (data && data.key && data.key !== "your_razorpay_key_id") {
        key = data.key;
        console.log("Dynamically loaded active Razorpay key ID:", key);
      }
    } catch (err) {
      console.error("Failed to fetch Razorpay key dynamically, will fallback to build env:", err);
    }
  }

  // 3. Fallback to build-time environment variable if dynamic load failed
  if (!key || key === "your_razorpay_key_id") {
    key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  }

  // 4. Ultimate fallback to active test key if still placeholder
  if (!key || key === "your_razorpay_key_id") {
    key = "rzp_test_T0P4HP3XQF8ksO";
  }

  let paymentDone = false;

  const logoUrl = typeof window !== "undefined" && window.location.origin
    ? `${window.location.origin}/taskly-logo.png`
    : undefined;

  const options: RazorpayOptions = {
    key,
    amount: sanitizedAmount * 100, // paise
    currency: "INR",
    name: "Tasskly Consultancy",
    description: `Payment for: ${jobTitle}`,
    image: logoUrl,
    order_id: orderId,
    handler: (response: any) => {
      if (response && response.razorpay_payment_id) {
        paymentDone = true;
        onSuccess(response);
      } else {
        console.error("Payment response missing payment ID");
        onFailure("Payment response missing Razorpay payment ID");
      }
    },
    prefill: {
      email: sanitizedEmail || undefined,
      contact: sanitizedPhone || undefined,
      name: sanitizedName || undefined,
    },
    theme: { color: "#2E45FF" },
    modal: {
      ondismiss: () => {
        if (!paymentDone && onCancel) onCancel();
      },
    },
  };

  try {
    const rzp = new window.Razorpay!(options);
    if (typeof rzp.on === "function") {
      rzp.on("payment.failed", (response: any) => {
        console.error("Razorpay payment.failed event:", response);
        const desc = response?.error?.description || "Payment failed or was declined by gateway";
        onFailure(desc);
      });
    }
    rzp.open();
  } catch (e: any) {
    console.error("Razorpay open error:", e);
    onFailure(e?.message || "Failed to initialize Razorpay checkout");
  }
}
