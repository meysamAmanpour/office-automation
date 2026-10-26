import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Start Seeding...")

  const roles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"]

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },

      update: {},

      create: {
        name,
      },
    })
  }

  console.log("✅ Roles Seeded")

  const permissions = [
    // Users
    {
      name: "users.read",
      description: "مشاهده کاربران",
    },
    {
      name: "users.create",
      description: "ایجاد کاربر",
    },
    {
      name: "users.update",
      description: "ویرایش کاربر",
    },
    {
      name: "users.delete",
      description: "حذف کاربر",
    },

    // Companies (SUPER_ADMIN)
    {
      name: "companies.read",
      description: "مشاهده شرکت‌ها",
    },
    {
      name: "companies.create",
      description: "ایجاد شرکت",
    },
    {
      name: "companies.update",
      description: "ویرایش شرکت",
    },
    {
      name: "companies.delete",
      description: "حذف شرکت",
    },

    // Departments داخل شرکت
    {
      name: "departments.read",
      description: "مشاهده دپارتمان‌ها",
    },
    {
      name: "departments.create",
      description: "ایجاد دپارتمان",
    },
    {
      name: "departments.update",
      description: "ویرایش دپارتمان",
    },
    {
      name: "departments.delete",
      description: "حذف دپارتمان",
    },

    // Letters
    {
      name: "letters.view",
      description: "مشاهده نامه‌ها",
    },
    {
      name: "letters.create",
      description: "ایجاد نامه",
    },
    {
      name: "letters.send",
      description: "ارسال نامه",
    },
    {
      name: "letters.archive",
      description: "بایگانی نامه",
    },

    {
      name: "letters.attachments.upload",
      description: "بارگذاری پیوست نامه",
    },

    {
      name: "reports.view",
      description: "مشاهده گزارش‌ها",
    },

    // مدیریت تنظیمات سیستم
    {
      name: "roles.manage",
      description: "مدیریت نقش‌ها",
    },
    {
      name: "permissions.manage",
      description: "مدیریت دسترسی‌ها",
    },
    {
      name: "users.role.update",
      description: "تغییر نقش کاربر",
    },

    {
      name: "users.company.update",
      description: "تغییر شرکت کاربر",
    },
    {
      name: "dashboard.view",
      description: "مشاهده داشبورد",
    },
    {
      name: "audit-logs.read",
      description: "مشاهده گزارش فعالیت‌ها",
    },
    {
      name: "letters.refer",
      description: "ارجاع نامه",
    },
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission.name,
      },

      update: {},

      create: permission,
    })
  }

  console.log("✅ Permissions Seeded")

  const allRoles = await prisma.role.findMany()

  const allPermissions = await prisma.permission.findMany()

  const rolePermissionMap = {
    SUPER_ADMIN: allPermissions.map((permission) => permission.name),

    ADMIN: [
      "users.read",
      "users.create",
      "users.update",
      "users.delete",

      "departments.read",
      "departments.create",
      "departments.update",
      "departments.delete",

      "letters.view",
      "letters.create",
      "letters.send",
      "letters.archive",
      "letters.attachments.upload",

      "reports.view",

      "dashboard.view",

      "audit-logs.read",

      "letters.refer",
    ],

    MANAGER: [
      "letters.view",
      "letters.create",
      "letters.attachments.upload",
      "reports.view",
      "dashboard.view",
      "letters.refer",
    ],

    EMPLOYEE: [
      "users.read",
      "departments.read",
      "letters.view",
      "letters.create",
      "letters.refer",
      "letters.attachments.upload",
    ],
  }
  for (const role of allRoles) {
    const permissions = rolePermissionMap[role.name] || []

    for (const permissionName of permissions) {
      const permission = allPermissions.find((p) => p.name === permissionName)

      if (!permission) continue

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },

        update: {},

        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      })
    }
  }

  const adminRole = allRoles.find((role) => role.name === "ADMIN")

  const companyPermissions = allPermissions.filter((permission) =>
    permission.name.startsWith("companies."),
  )

  if (adminRole) {
    await prisma.rolePermission.deleteMany({
      where: {
        roleId: adminRole.id,
        permissionId: {
          in: companyPermissions.map((permission) => permission.id),
        },
      },
    })
  }

  console.log("✅ Role Permissions Seeded")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
