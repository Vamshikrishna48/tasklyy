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
  // Ensure amount is a clean integer and at least 1 Rupee (100 paise)
  const sanitizedAmount = Math.max(1, Math.round(Number(amountInRupees) || 1));
  const sanitizedEmail = (userEmail && userEmail.trim()) ? userEmail.trim() : "";

  // Create overlay container
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200";
  
  overlay.innerHTML = `
    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform scale-95 transition-all duration-300 ease-out animate-in zoom-in-95">
      <!-- Header -->
      <div class="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 relative">
        <h3 class="text-xl font-bold font-display flex items-center gap-2">
          <span>Tasklyy Payment Portal</span>
        </h3>
        <p class="text-xs text-white/80 mt-1">Select your preferred payment gateway method</p>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <div class="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100 text-sm">
          <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Assignment</span>
            <span>Escrow Deposit</span>
          </div>
          <p class="font-bold text-slate-800 truncate">${jobTitle}</p>
          <div class="flex justify-between items-center pt-2 border-t border-slate-200/60">
            <span class="text-xs font-bold text-slate-500">Total Budget</span>
            <span class="text-xl font-black text-violet-600">₹${sanitizedAmount}</span>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose Gateway Option:</p>
          
          <!-- Option 1: Demo Simulator -->
          <button id="btn-demo-sim" class="w-full p-4 text-left rounded-2xl border-2 border-violet-600 bg-violet-50/50 hover:bg-violet-50 transition-all flex items-start gap-3 group">
            <div class="h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 group-hover:scale-110 transition-transform">🧪</div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-800 text-sm">Tasklyy Demo Simulator</span>
                <span class="text-[9px] font-black uppercase bg-violet-600 text-white px-2 py-0.5 rounded-full tracking-wider shrink-0">Bypass</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">Instant simulated confirmation. Perfect for testing levels, ledgers, and marketplace flows without API keys.</p>
            </div>
          </button>

          <!-- Option 2: Razorpay API -->
          <button id="btn-razorpay" class="w-full p-4 text-left rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex items-start gap-3 group">
            <div class="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 group-hover:scale-110 transition-transform">💳</div>
            <div class="min-w-0 flex-1">
              <span class="font-bold text-slate-800 text-sm">Secure Razorpay Checkout</span>
              <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">Use Razorpay's standard UI window. Requires a valid VITE_RAZORPAY_KEY_ID in Vercel settings.</p>
            </div>
          </button>
        </div>

        <div class="flex gap-2 pt-2">
          <button id="btn-cancel-portal" class="w-full py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all">
            Cancel Payment
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close and Cleanup helper
  const cleanup = () => {
    overlay.classList.add("fade-out");
    setTimeout(() => overlay.remove(), 200);
  };

  // ── Button: Demo Simulator ──
  overlay.querySelector("#btn-demo-sim")?.addEventListener("click", () => {
    cleanup();
    onSuccess();
  });

  // ── Button: Secure Razorpay ──
  overlay.querySelector("#btn-razorpay")?.addEventListener("click", async () => {
    cleanup();
    
    // Launch Razorpay standard flow
    const isLoaded = await loadRazorpay();
    if (!isLoaded || !window.Razorpay) {
      console.error("Razorpay script not available.");
      onFailure();
      return;
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) {
      console.error("VITE_RAZORPAY_KEY_ID is missing.");
      onFailure();
      return;
    }

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
      prefill: { email: sanitizedEmail || undefined },
      theme: { color: "#7c3aed" },
      modal: {
        ondismiss: () => {
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
  });

  // ── Button: Cancel ──
  overlay.querySelector("#btn-cancel-portal")?.addEventListener("click", () => {
    cleanup();
    if (onCancel) onCancel();
  });
}
