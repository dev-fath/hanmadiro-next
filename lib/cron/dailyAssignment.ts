import { prisma } from "@/lib/db/client";
import { sendPushNotification } from "@/lib/firebase/push";
import logger from "@/lib/logger";

export async function assignDailyMessages(): Promise<void> {
  const startTime = Date.now();

  try {
    logger.info("Daily message assignment started");

    // 모든 유효한 푸시 토큰 조회
    const pushTokens = await prisma.pushToken.findMany({
      where: { isValid: true },
    });

    if (pushTokens.length === 0) {
      logger.info("No valid push tokens found");
      return;
    }

    // 모든 메시지 조회
    const messages = await prisma.message.findMany();

    if (messages.length === 0) {
      logger.info("No messages found");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    // 각 푸시 토큰에 대해 랜덤 메시지 할당 및 발송
    for (const pushToken of pushTokens) {
      try {
        // 랜덤 메시지 선택
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // 푸시 발송
        const success = await sendPushNotification({
          token: pushToken.token,
          title: randomMessage.title,
          body: randomMessage.body,
        });

        // 할당 및 로그 기록
        await prisma.messageAssignment.create({
          data: {
            pushTokenId: pushToken.id,
            messageId: randomMessage.id,
            sentAt: new Date(),
            status: success ? "SENT" : "FAILED",
          },
        });

        await prisma.pushLog.create({
          data: {
            pushTokenId: pushToken.id,
            messageId: randomMessage.id,
            sentAt: new Date(),
            success,
            ...(success ? {} : { errorMessage: "푸시 발송 실패" }),
          },
        });

        if (success) {
          successCount++;
          await prisma.pushToken.update({
            where: { id: pushToken.id },
            data: { lastUsedAt: new Date() },
          });
        } else {
          failCount++;
          await prisma.pushToken.update({
            where: { id: pushToken.id },
            data: { isValid: false },
          });
        }
      } catch (error) {
        failCount++;
        logger.error(`Failed to assign message to token ${pushToken.id}`, { error });
      }
    }

    const executionTime = Date.now() - startTime;

    // Cron 작업 로그 기록
    await prisma.cronJobLog.create({
      data: {
        jobName: "daily-assignment",
        executedAt: new Date(),
        status: "SUCCESS",
        executionTimeMs: executionTime,
      },
    });

    logger.info("Daily message assignment completed", {
      totalTokens: pushTokens.length,
      successCount,
      failCount,
      executionTimeMs: executionTime,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;

    await prisma.cronJobLog.create({
      data: {
        jobName: "daily-assignment",
        executedAt: new Date(),
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : String(error),
        executionTimeMs: executionTime,
      },
    });

    logger.error("Daily message assignment failed", { error, executionTimeMs: executionTime });
    throw error;
  }
}

