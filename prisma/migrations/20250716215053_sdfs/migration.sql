/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `user_files` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - Added the required column `avatar_key` to the `user_files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_files" DROP COLUMN "avatar_url",
ADD COLUMN     "avatar_key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar";
