import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

// In-app notification state
export type PlatformNotification = {
  id: string;
  type: "bid" | "acceptance" | "payment" | "timeout" | "work_submitted";
  jobTitle: string;
  amount: number;
  user: string;
  timestamp: number;
  read?: boolean;
};

// Global persistent notification history for the admin session
let notificationLogs: PlatformNotification[] = [];
let notificationListeners: ((n: PlatformNotification) => void)[] = [];

export function useNotificationPermission() {
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);
}

export function usePlatformNotifications() {
  const [notifications, setNotifications] = useState<PlatformNotification[]>(notificationLogs);

  useEffect(() => {
    const listener = (n: PlatformNotification) => {
      setNotifications((prev) => [n, ...prev]);
    };
    notificationListeners.push(listener);
    return () => {
      notificationListeners = notificationListeners.filter((l) => l !== listener);
    };
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    notificationLogs = notificationLogs.filter((n) => n.id !== id);
  }, []);

  return { notifications, clearNotification };
}

// Play a loud alarm sound that works even with system sounds
function playAlarmSound(frequency: number = 880, pattern: number[] = [200, 200, 200, 200], volume: number = 1.0) {
  try {
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = "square";
    gainNode.gain.value = volume;
    oscillator.start();

    let time = 0;
    pattern.forEach((duration, i) => {
      setTimeout(() => {
        gainNode.gain.value = i % 2 === 0 ? volume : 0;
      }, time);
      time += duration;
    });

    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, time + 100);
  } catch (e) {
    // Audio not supported
  }
}

function sendBrowserNotification(title: string, body: string) {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: `notif-${Date.now()}`,
        requireInteraction: true,
      });
    } catch (e) {
      // Browser notification not available
    }
  }
}

function recordNotification(notif: PlatformNotification) {
  notificationLogs = [notif, ...notificationLogs];
  notificationListeners.forEach((l) => l(notif));
}

export function sendBidNotification(jobTitle: string, bidAmount: number, bidderName: string) {
  const notification: PlatformNotification = {
    id: `bid-${Date.now()}`,
    type: "bid",
    jobTitle,
    amount: bidAmount,
    user: bidderName,
    timestamp: Date.now(),
  };

  recordNotification(notification);

  toast.success(`🔔 New Bid Alert!`, {
    description: `${bidderName} bid ₹${bidAmount} on "${jobTitle}"`,
    duration: 8000,
  });

  playAlarmSound(880, [150, 100, 150, 100, 150, 100, 300], 1.0);

  sendBrowserNotification(
    "🔔 New Bid on Your Job!",
    `${bidderName} bid ₹${bidAmount} on "${jobTitle}"`
  );
}

export function sendJobAcceptedAlarm(jobTitle: string, amount: number) {
  const notification: PlatformNotification = {
    id: `accept-${Date.now()}`,
    type: "acceptance",
    jobTitle,
    amount,
    user: "System",
    timestamp: Date.now(),
  };
  
  recordNotification(notification);

  toast.success("✅ Bid Accepted!", {
    description: `Payment of ₹${amount} must be completed within 10 minutes for "${jobTitle}".`,
    duration: 15000,
  });

  playAlarmSound(660, [200, 100, 200, 100, 200, 100, 200, 100, 400], 1.0);

  sendBrowserNotification(
    "✅ Your Bid Has Been Accepted!",
    `Complete payment of ₹${amount} within 10 minutes for "${jobTitle}".`
  );
}

export function sendPaymentTimeoutNotification(jobTitle: string) {
  const notification: PlatformNotification = {
    id: `timeout-${Date.now()}`,
    type: "timeout",
    jobTitle,
    amount: 0,
    user: "System",
    timestamp: Date.now(),
  };
  
  recordNotification(notification);

  toast.error("⏰ Payment Timeout!", {
    description: `The project "${jobTitle}" has been automatically deleted due to payment timeout.`,
    duration: 10000,
  });

  playAlarmSound(440, [300, 200, 300, 200, 500], 0.8);

  sendBrowserNotification(
    "⏰ Project Deleted - Payment Timeout",
    `"${jobTitle}" was automatically removed because payment was not completed within 10 minutes.`
  );
}

export function sendPaymentVerifiedNotification(jobTitle: string, amount: number, deadline: string) {
  const notification: PlatformNotification = {
    id: `payment-${Date.now()}`,
    type: "payment",
    jobTitle,
    amount,
    user: "System",
    timestamp: Date.now(),
  };
  
  recordNotification(notification);

  toast.success("💰 Payment Verified!", {
    description: `Your bid for "${jobTitle}" has been accepted. Complete the project by ${new Date(deadline).toLocaleDateString()}.`,
    duration: 10000,
  });

  playAlarmSound(1046, [100, 80, 100, 80, 100, 80, 300], 0.6);

  sendBrowserNotification(
    "💰 Payment Verified - Start Working!",
    `Complete "${jobTitle}" by ${new Date(deadline).toLocaleDateString()}. Project files are now accessible.`
  );
}

export function sendWorkSubmittedNotification(jobTitle: string, freelancerName: string) {
  const notification: PlatformNotification = {
    id: `work-${Date.now()}`,
    type: "work_submitted",
    jobTitle,
    amount: 0,
    user: freelancerName,
    timestamp: Date.now(),
  };
  
  recordNotification(notification);

  toast.success("📦 Work Submitted!", {
    description: `The freelancer has submitted their work for "${jobTitle}". Please review.`,
    duration: 10000,
  });

  playAlarmSound(784, [150, 100, 150, 100, 200], 0.6);

  sendBrowserNotification(
    "📦 Project Completed!",
    `Work has been submitted for "${jobTitle}". Please review the submission.`
  );
}
