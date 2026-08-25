/** Common Indian UPI PSP / bank handles (NPCI VPA suffix). */
export const KNOWN_UPI_HANDLES = [
  "ybl", "okaxis", "okhdfcbank", "okicici", "oksbi", "paytm", "pthdfc",
  "ptaxis", "ptyes", "ptsbi", "axl", "ibl", "upi", "apl", "abfspay",
  "amazonpay", "apl", "axisbank", "barodampay", "birla", "citi", "citibank",
  "dbl", "dbs", "equitas", "federal", "freecharge", "hsbc", "icici", "idbi",
  "idfcbank", "indus", "jupiteraxis", "kbl", "kmbl", "kotak", "kvb", "mahb",
  "mobikwik", "naviaxis", "olamoney", "payzapp", "pingpay", "pnb", "rbl",
  "sbi", "sib", "sliceaxis", "tapicici", "timesbank", "ubi", "unionbank",
  "unity", "vijb", "waicici", "waaxis", "wahdfcbank", "wasbi", "yesbank",
  "yesbankltd", "okbizaxis", "ikwik", "jupiter", "razorpay", "bhim",
];

const UPI_VPA_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;

export type UpiValidationResult = {
  valid: boolean;
  normalized: string;
  handle: string;
  message: string;
};

/**
 * Validates UPI VPA format and known PSP handle.
 * Does not call external networks — use verifyUpiWithApi for server verification.
 */
export const validateUpiId = (raw: string): UpiValidationResult => {
  const normalized = (raw || "").trim().toLowerCase().replace(/\s+/g, "");

  if (!normalized) {
    return { valid: false, normalized: "", handle: "", message: "Please enter a UPI ID" };
  }

  if (!normalized.includes("@")) {
    return {
      valid: false,
      normalized,
      handle: "",
      message: "UPI ID must be in format: name@bank (e.g. 9876543210@paytm)",
    };
  }

  if (!UPI_VPA_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      handle: "",
      message: "Invalid UPI format. Use only letters, numbers, ., _, - before @",
    };
  }

  const handle = normalized.split("@")[1] || "";
  const isKnownHandle = KNOWN_UPI_HANDLES.includes(handle);

  if (!isKnownHandle) {
    return {
      valid: false,
      normalized,
      handle,
      message: `Unknown UPI handle "@${handle}". Use a valid bank/PSP handle (e.g. @ybl, @okaxis, @paytm)`,
    };
  }

  return {
    valid: true,
    normalized,
    handle,
    message: "UPI ID looks valid",
  };
};
