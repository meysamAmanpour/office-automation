import { readFile } from "fs/promises"
import path from "path"

import { prisma } from "@/lib/prisma"
import { failure } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

export const GET = protectedRoute(
  { permissions: ["letters.view"] },
  async (request, context, currentUser) => {
    const { id: letterId, attachmentId } = await context.params

    const attachment = await prisma.letterAttachment.findFirst({
      where: {
        id: attachmentId,
        letterId,
        kind: "LETTER",
        letter: {
          companyId: currentUser.companyId,
          isDeleted: false,
        },
      },
      include: {
        letter: {
          select: {
            id: true,
            creatorId: true,
            recipients: {
              where: { userId: currentUser.id },
              select: { id: true },
            },
            referrals: {
              where: {
                targetUserId: currentUser.id,
                status: {
                  in: ["PENDING", "RECEIVED", "IN_PROGRESS"],
                },
              },
              select: { id: true },
            },
          },
        },
      },
    })

    if (!attachment) {
      return failure("پیوست پیدا نشد", 404)
    }

    const isCreator = attachment.letter.creatorId === currentUser.id
    const isDirectRecipient = attachment.letter.recipients.length > 0
    const isReferralRecipient = attachment.letter.referrals.length > 0

    if (!isCreator && !isDirectRecipient && !isReferralRecipient) {
      return failure("اجازه دانلود این فایل را ندارید", 403)
    }

    const filePath = path.join(
      process.cwd(),
      "storage",
      "letter-attachments",
      attachment.storedName,
    )

    let buffer

    try {
      buffer = await readFile(filePath)
    } catch {
      return failure("فایل روی سرور پیدا نشد", 404)
    }

    const safeName = attachment.originalName.replace(/[\r\n"]/g, "_")

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(buffer.length),
        "Content-Disposition": `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    })
  },
)
