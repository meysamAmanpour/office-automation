import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Start User Role Migration...")

  const roles = await prisma.role.findMany()

  const roleMap = new Map(roles.map((role) => [role.name, role.id]))

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      roleId: true,
    },
  })

  for (const user of users) {
    if (user.roleId) {
      console.log(`⏭️ ${user.username} already has roleId`)

      continue
    }

    const roleId = roleMap.get(user.role)

    if (!roleId) {
      console.log(`❌ Role not found for ${user.username}: ${user.role}`)

      continue
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        roleId,
      },
    })

    console.log(`✅ ${user.username} → ${user.role}`)
  }

  console.log("🎉 User Role Migration Completed")
}

main()
  .catch((error) => {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
