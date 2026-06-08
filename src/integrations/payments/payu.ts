import { getApiUrl } from "@/lib/api";

/**
 * Initiates the PayU Web Hosted Checkout redirection.
 * Communicates with backend /api/payu-hash to sign parameters securely.
 */
export async function openPayUCheckout(
  amountInRupees: number,
  jobId: string,
  jobTitle: string,
  userEmail: string | null,
  firstName: string | null,
  workerId: string,
  posterId: string,
  onFailure: () => void
) {
  const sanitizedAmount = Math.max(1, Math.round(Number(amountInRupees) || 1));
  const sanitizedEmail = (userEmail && userEmail.trim()) ? userEmail.trim() : "customer@tasskly.com";
  const sanitizedName = (firstName && firstName.trim()) ? firstName.trim() : "Student";
  const sanitizedProductInfo = jobTitle.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 100) || "JobPayment";
 
  try {
    // 1. Fetch PayU Hash & Post URL from backend
    const response = await fetch(getApiUrl("/api/payu-hash"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        amount: sanitizedAmount,
        productInfo: sanitizedProductInfo,
        firstName: sanitizedName,
        email: sanitizedEmail,
        workerId,
        posterId
      })
    });

    const resData = await response.json();
    if (!resData || !resData.success) {
      console.error("[PayU Hash Generation Failed]", resData ? resData.error : "Unknown error");
      onFailure();
      return;
    }

    // 2. Dynamically build a form and submit it to PayU's Web Checkout
    const form = document.createElement("form");
    form.method = "POST";
    form.action = resData.postUrl;

    const fields = {
      key: resData.key,
      txnid: resData.txnid,
      amount: resData.amount.toString(),
      productinfo: resData.productinfo,
      firstname: resData.firstname,
      email: resData.email,
      phone: (() => {
        const prefix = ["7", "8", "9"][Math.floor(Math.random() * 3)];
        const rest = Math.floor(100000000 + Math.random() * 900000000).toString().substring(0, 9);
        return prefix + rest;
      })(),
      surl: 'https://tasskly-tawny.vercel.app/api/payu-success',
      furl: 'https://tasskly-tawny.vercel.app/api/payu-failure',
      udf1: resData.udf1,
      udf2: resData.udf2,
      udf3: resData.udf3,
      udf4: resData.udf4,
      udf5: resData.udf5 || '',
      hash: resData.hash,
      service_provider: 'payu_paisa'
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (err) {
    console.error("PayU checkout redirection failed:", err);
    onFailure();
  }
}
