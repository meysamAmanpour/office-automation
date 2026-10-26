export function dashboardDTO(data) {
  return {
    letters: {
      total: data.letters?.letters?.total ?? 0,
      draft: data.letters?.letters?.draft ?? 0,
      sent: data.letters?.letters?.sent ?? 0,

      recipients: {
        pending: data.letters?.recipients?.pending ?? 0,
        received: data.letters?.recipients?.received ?? 0,
        read: data.letters?.recipients?.read ?? 0,
        archived: data.letters?.recipients?.archived ?? 0,
      },
    },

    users: {
      total: data.users?.total ?? 0,
      active: data.users?.active ?? 0,
    },

    departments: {
      total: data.departments?.total ?? 0,
    },

    companies: data.companies
      ? {
          total: data.companies.total ?? 0,
        }
      : null,
  }
}
