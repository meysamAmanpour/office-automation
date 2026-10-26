export function incomingDTO(letter) {
  const recipient = letter.recipients?.[0]

  const canViewBody =
    recipient?.status === "READ" || recipient?.status === "ARCHIVED"

  return {
    id: letter.id,

    letterNumber: letter.letterNumber,

    subject: letter.subject,

    ...(canViewBody
      ? {
          body: letter.body,
        }
      : {}),

    type: letter.type,

    priority: letter.priority,

    status: letter.status,

    sender: letter.creator
      ? {
          id: letter.creator.id,
          fullName: letter.creator.fullName,
          username: letter.creator.username,
        }
      : null,

    department: letter.department
      ? {
          id: letter.department.id,
          name: letter.department.name,
        }
      : null,

    recipient: recipient
      ? {
          id: recipient.id,

          type: recipient.recipientType,

          status: recipient.status,

          receivedAt: recipient.receivedAt,

          readAt: recipient.readAt,
        }
      : null,

    createdAt: letter.createdAt,

    updatedAt: letter.updatedAt,
  }
}
