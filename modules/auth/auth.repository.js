import { prisma } from "@/lib/prisma"

export async function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      company: true,
      department: true,
      roleRelation: true,
    },
  })
}

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      company: true,
      department: true,
      roleRelation: true,
    },
  })
}
