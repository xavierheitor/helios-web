import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const username = "admin";
  const plainPassword = "@adminadmin123";

  // Hash the password before saving it to the database
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Create the user in the database
  const user = await prisma.user.upsert({
    where: { username },
    update: {}, // No update logic since this is a seed; prevents duplicate inserts
    create: {
      username,
      password: hashedPassword,
      name: "Administrator", // Optionally, you can set the name field
    },
  });

  console.log(`User created: ${user.username}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
