import { randomUUID } from "crypto"
import { mkdir, writeFile, unlink } from "fs/promises"
import path from "path"

import { prisma } from "@/lib/prisma"
import { success, failure } from "@/helpers/apiResponse"
import protectedRoute from "@/helpers/auth/protectedRoute"

const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_TYPES = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
}

export const GET = protectedRoute(
  { permissions: ["letters.view"] },
  async (request, context, currentUser) => {
    const { id: letterId } = await context.params

    const letter = await prisma.letter.findFirst({
      where: {
        id: letterId,
        companyId: currentUser.companyId,
        isDeleted: false,
      },
      select: {
        id: true,
        creatorId: true,
        recipients: {
          where: {
            userId: currentUser.id,
          },
          select: {
            id: true,
          },
        },
        referrals: {
          where: {
            targetUserId: currentUser.id,
            status: {
              in: ["PENDING", "RECEIVED", "IN_PROGRESS"],
            },
          },
          select: {
            id: true,
          },
        },
      },
    })

    if (!letter) {
      return failure("نامه پیدا نشد یا به آن دسترسی ندارید", 404)
    }

    const isCreator = letter.creatorId === currentUser.id
    const isDirectRecipient = letter.recipients.length > 0
    const isReferralRecipient = letter.referrals.length > 0

    if (!isCreator && !isDirectRecipient && !isReferralRecipient) {
      return failure("شما اجازه مشاهده پیوست‌های این نامه را ندارید", 403)
    }

    const attachments = await prisma.letterAttachment.findMany({
      where: {
        letterId,
        kind: "LETTER",
      },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        size: true,
        createdAt: true,
        uploadedBy: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return success(attachments, "فهرست پیوست‌های نامه")
  },
)

export const POST = protectedRoute(
  {
    permissions: ["letters.attachments.upload"],
  },
  async (request, context, currentUser) => {
    const { id: letterId } = await context.params

    const letter = await prisma.letter.findFirst({
      where: {
        id: letterId,
        companyId: currentUser.companyId,
        isDeleted: false,
      },
      select: {
        id: true,
        creatorId: true,
      },
    })

    if (!letter) {
      return failure("نامه پیدا نشد یا به آن دسترسی ندارید", 404)
    }

    // در این مرحله فقط سازنده نامه می‌تواند پیوست اصلی اضافه کند.
    if (letter.creatorId !== currentUser.id) {
      return failure("فقط سازنده نامه می‌تواند پیوست اصلی اضافه کند", 403)
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (
      !file ||
      typeof file === "string" ||
      typeof file.arrayBuffer !== "function"
    ) {
      return failure("فایلی انتخاب نشده است", 400)
    }

    const extension = ALLOWED_TYPES[file.type]

    if (!extension) {
      return failure("فرمت فایل مجاز نیست", 400)
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return failure("حجم فایل باید بیشتر از صفر و حداکثر ۱۰ مگابایت باشد", 400)
    }

    const storedName = `${randomUUID()}${extension}`
    const uploadDirectory = path.join(
      process.cwd(),
      "storage",
      "letter-attachments",
    )
    const filePath = path.join(uploadDirectory, storedName)

    await mkdir(uploadDirectory, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())

    // بررسی امضای ابتدایی فایل برای جلوگیری از اتکا به MIME ارسالی کاربر
    const signatures = {
      "application/pdf": buffer.subarray(0, 5).toString() === "%PDF-",
      "image/jpeg":
        buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
      "image/png": buffer
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        buffer.subarray(0, 2).toString() === "PK",
    }

    if (!signatures[file.type]) {
      return failure("محتوای فایل با فرمت اعلام‌شده مطابقت ندارد", 400)
    }

    await writeFile(filePath, buffer, { flag: "wx" })

    try {
      const attachment = await prisma.letterAttachment.create({
        data: {
          letterId,
          uploadedById: currentUser.id,
          kind: "LETTER",
          originalName: path.basename(file.name),
          storedName,
          mimeType: file.type,
          size: file.size,
        },
        select: {
          id: true,
          letterId: true,
          originalName: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      })

      return success(attachment, "پیوست نامه با موفقیت ذخیره شد", 201)
    } catch (error) {
      await unlink(filePath).catch(() => {})
      throw error
    }
  },
)
