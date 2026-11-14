/*
  Warnings:

  - Added the required column `userId` to the `Habit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PushSubscription" ADD COLUMN     "userId" TEXT NOT NULL;
