export function inboxDTO(item) {
  const letter = item.letter

  return {
    id: item.id,
    letterId: letter.id,

    subject: letter.subject,
    letterNumber: letter.letterNumber,

    type: letter.type,
    priority: letter.priority,

    recipientType: item.recipientType,
    recipientStatus: item.status,

    receivedAt: item.receivedAt,
    readAt: item.readAt,

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

    createdAt: letter.createdAt,
  }
}
