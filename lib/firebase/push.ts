import { getMessaging, Message } from "firebase-admin/messaging";
import { getFirebaseAdmin } from "./admin";
import logger from "@/lib/logger";

export interface PushMessageData {
  title: string;
  body: string;
  token: string;
}

export async function sendPushNotification(data: PushMessageData): Promise<boolean> {
  try {
    const admin = getFirebaseAdmin();
    const messaging = getMessaging(admin);

    const message: Message = {
      notification: {
        title: data.title,
        body: data.body,
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        navigation: "main",
      },
      token: data.token,
      android: {
        priority: "high",
        notification: {
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    };

    const response = await messaging.send(message);
    logger.info("Push notification sent", {
      messageId: response,
      token: data.token.substring(0, 20) + "...",
    });

    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error && typeof error === "object" && "code" in error ? String(error.code) : undefined;

    logger.error("Push notification failed", {
      error: errorMessage,
      code: errorCode,
      token: data.token.substring(0, 20) + "...",
    });

    // 토큰이 유효하지 않은 경우
    if (
      errorCode === "messaging/invalid-registration-token" ||
      errorCode === "messaging/registration-token-not-registered"
    ) {
      return false;
    }

    throw error;
  }
}

