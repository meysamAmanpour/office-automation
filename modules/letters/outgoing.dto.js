export function outgoingDTO(letter) {
  return {
    id: letter.id,

    letterNumber: letter.letterNumber,

    subject: letter.subject,

    body: letter.body,

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

    recipients: letter.recipients
      ? letter.recipients.map((recipient) => ({
          id: recipient.id,

          type: recipient.recipientType,

          status: recipient.status,

          receivedAt: recipient.receivedAt,

          readAt: recipient.readAt,

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
        }))
      : [],

    createdAt: letter.createdAt,

    updatedAt: letter.updatedAt,
  }
}
