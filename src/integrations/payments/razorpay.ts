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

export function openRazorpayCheckout(
  amountInRupees: number,
  jobTitle: string,
  userEmail: string | null,
  onSuccess: () => void,
  onFailure: () => void
) {
  if (!window.Razorpay) {
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

