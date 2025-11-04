import { z } from "zod";

export const messageTitleSchema = z.string().min(1, "제목은 필수입니다").max(255, "제목은 최대 255자까지 허용됩니다");
export const messageBodySchema = z.string().min(1, "내용은 필수입니다").max(255, "내용은 최대 255자까지 허용됩니다");

export const createMessageSchema = z.object({
  title: messageTitleSchema,
  body: messageBodySchema,
});

export const updateMessageSchema = createMessageSchema.partial();

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;

