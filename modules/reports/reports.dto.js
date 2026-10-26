export function reportLetterDTO(letter) {
  return {
    id: letter.id,

    letterNumber: letter.letterNumber,

    subject: letter.subject,

    body: letter.body,

    type: letter.type,

    status: letter.status,

    priority: letter.priority,

    sender: letter.creator
      ? {
          id: letter.creator.id,
          fullName: letter.creator.fullName,
          username: letter.creator.username,
        }
      : null,

    company: letter.company
      ? {
          id: letter.company.id,
          name: letter.company.name,
          code: letter.company.code,
        }
      : null,

    department: letter.department
      ? {
          id: letter.department.id,
          name: letter.department.name,
        }
      : null,

    recipients: letter.recipients.map((recipient) => ({
      id: recipient.id,

      type: recipient.recipientType,

      status: recipient.status,

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
            code: recipient.company.code,
          }
        : null,

      receivedAt: recipient.receivedAt,

      readAt: recipient.readAt,
    })),

    createdAt: letter.createdAt,

    updatedAt: letter.updatedAt,
  }
}

export function reportSummaryDTO(summary) {
  return {
    total: summary.total,

    draft: summary.draft,

    sent: summary.sent,

    recipients: {
      pending: summary.recipients.pending,
      received: summary.recipients.received,
      read: summary.recipients.read,
      archived: summary.recipients.archived,
    },
  }
}
