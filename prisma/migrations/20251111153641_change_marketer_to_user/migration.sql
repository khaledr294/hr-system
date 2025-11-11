-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_marketerId_fkey";

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_marketerId_fkey" FOREIGN KEY ("marketerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
