type RazorpayHandler = (response: any) => void;

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: RazorpayHandler;
  prefill?: { email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
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
 * Opens the Razorpay checkout modal.
 * onSuccess  — payment completed successfully
 * onFailure  — payment genuinely failed (network / API error)
 * onCancel   — user dismissed the modal (no error toast)
 */
export async function openRazorpayCheckout(
  amountInRupees: number,
  jobTitle: string,
  userEmail: string | null,
  onSuccess: () => void,
  onFailure: () => void,
  onCancel?: () => void
) {
  const isLoaded = await loadRazorpay();
  if (!isLoaded || !window.Razorpay) {
    console.error("Razorpay script not available.");
    onFailure();
    return;
  }

  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!key) {
    console.error(
      "VITE_RAZORPAY_KEY_ID is missing. " +
      "Add it to your Vercel/Netlify environment variables."
    );
    onFailure();
    return;
  }

  // Ensure amount is a clean integer and at least 1 Rupee (100 paise)
  const sanitizedAmount = Math.max(1, Math.round(Number(amountInRupees) || 1));
  // Ensure email is formatted correctly or omitted if empty
  const sanitizedEmail = (userEmail && userEmail.trim()) ? userEmail.trim() : undefined;

  let paymentDone = false;

  const options: RazorpayOptions = {
    key,
    amount: sanitizedAmount * 100, // paise
    currency: "INR",
    name: "Tasklyy Platform",
    description: `Payment for: ${jobTitle}`,
    handler: (response: any) => {
      if (response.razorpay_payment_id) {
        paymentDone = true;
        onSuccess();
      } else {
        console.error("Payment response missing payment ID");
        onFailure();
      }
    },
    prefill: { email: sanitizedEmail },
    theme: { color: "#7c3aed" },
    modal: {
      ondismiss: () => {
        // Only fire if payment wasn't completed
        if (!paymentDone && onCancel) onCancel();
      },
    },
  };

  try {
    const rzp = new window.Razorpay!(options);
    rzp.open();
  } catch (e) {
    console.error("Razorpay error:", e);
    onFailure();
  }
}
