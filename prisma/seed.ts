import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

import { SHOP_DATA } from "./DummyShopData";

const prisma = new PrismaClient();

const main = async () => {
  const hashedPassword = await hash("admin", 10);
  await prisma.user.create({
    data: {
      name: "Majid Zahedi",
      email: "majidzahedi@hotmail.com",
      password: { create: { hash: hashedPassword } },
      role: "ADMIN",
    },
  });

  await prisma.product.createMany(SHOP_DATA);
};

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
