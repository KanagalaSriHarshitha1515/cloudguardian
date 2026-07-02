/*
  Warnings:

  - You are about to drop the column `hostname` on the `DockerHost` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `DockerHost` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `DockerHost` table. All the data in the column will be lost.
  - Added the required column `host` to the `DockerHost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `DockerHost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DockerHost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DockerHost" DROP COLUMN "hostname",
DROP COLUMN "ipAddress",
DROP COLUMN "status",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "host" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
