export function letterDTO(letter) {
  if (!letter) {
    return null
  }

  return {
    id: letter.id,

    letterNumber: letter.letterNumber,

    subject: letter.subject,

    body: letter.body,

    type: letter.type,

    status: letter.status,

    priority: letter.priority,

    senderName: letter.senderName,

    senderOrganization: letter.senderOrganization,

    receiverName: letter.receiverName,

    receiverOrganization: letter.receiverOrganization,

    company: letter.company
      ? {
          id: letter.company.id,
          name: letter.company.name,
        }
      : null,

    department: letter.department
      ? {
          id: letter.department.id,
          name: letter.department.name,
        }
      : null,

    creator: letter.creator
      ? {
          id: letter.creator.id,
          fullName: letter.creator.fullName,
          username: letter.creator.username,
        }
      : null,
    recipients: letter.recipients
      ? letter.recipients.map((recipient) => ({
          id: recipient.id,

          type: recipient.recipientType,

          user: recipient.user
            ? {
                id: recipient.user.id,
                fullName: recipient.user.fullName,
                username: recipient.user.username,
              }
            : null,

          department: recipient.department
            ? {
                id: recipient.department.id,
                name: recipient.department.name,
              }
            : null,

          company: recipient.company
            ? {
                id: recipient.company.id,
                name: recipient.company.name,
              }
            : null,

          status: recipient.status,

          readAt: recipient.readAt,

          receivedAt: recipient.receivedAt,
        }))
      : [],

    createdAt: letter.createdAt,

    updatedAt: letter.updatedAt,
  }
}
