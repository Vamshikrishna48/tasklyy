type RazorpayHandler = (response: any) => void;

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: RazorpayHandler;
  prefill?: {
    email?: string;
  };
  theme?: {
    color?: string;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Razorpay SDK failed to load. Are you offline or using an adblocker?");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export async function openRazorpayCheckout(
  amountInRupees: number,
  jobTitle: string,
  userEmail: string | null,
  onSuccess: () => void,
  onFailure: () => void
) {
  const isLoaded = await loadRazorpay();
  if (!isLoaded || !window.Razorpay) {
    console.error("Razorpay script not available.");
    onFailure();
    return;
  }

  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!key) {
    console.error("VITE_RAZORPAY_KEY_ID is not set");
    onFailure();
    return;
  }

  const options: RazorpayOptions = {
    key,
    amount: amountInRupees * 100, // Razorpay works in paise
    currency: "INR",
    name: "Taskly Platform",
    description: `Payment for job: ${jobTitle}`,
    handler: () => {
      onSuccess();
    },
    prefill: {
      email: userEmail ?? undefined,
    },
    theme: {
      color: "#16a34a",
    },
  };

  const rzp = new window.Razorpay!(options);
  try {
    rzp.open();
  } catch (e) {
    console.error(e);
    onFailure();
  }
}

