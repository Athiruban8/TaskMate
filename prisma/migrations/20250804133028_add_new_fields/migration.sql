/*
  Warnings:

  - You are about to drop the column `skills` on the `Project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."MemberStatus" AS ENUM ('ACTIVE', 'LEFT', 'REMOVED');

-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "skills",
ADD COLUMN     "teamSize" INTEGER NOT NULL DEFAULT 3,
ALTER COLUMN "city" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "skills" TEXT[];

-- CreateTable
CREATE TABLE "public"."Technology" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Industry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectTech" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,

    CONSTRAINT "ProjectTech_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectCategory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ProjectCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectIndustry" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,

    CONSTRAINT "ProjectIndustry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "public"."MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Technology_name_key" ON "public"."Technology"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Technology_slug_key" ON "public"."Technology"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_name_key" ON "public"."Industry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "public"."Industry"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTech_projectId_technologyId_key" ON "public"."ProjectTech"("projectId", "technologyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCategory_projectId_categoryId_key" ON "public"."ProjectCategory"("projectId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectIndustry_projectId_industryId_key" ON "public"."ProjectIndustry"("projectId", "industryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_userId_projectId_key" ON "public"."ProjectMember"("userId", "projectId");

-- AddForeignKey
ALTER TABLE "public"."ProjectTech" ADD CONSTRAINT "ProjectTech_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectTech" ADD CONSTRAINT "ProjectTech_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "public"."Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectCategory" ADD CONSTRAINT "ProjectCategory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectCategory" ADD CONSTRAINT "ProjectCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectIndustry" ADD CONSTRAINT "ProjectIndustry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectIndustry" ADD CONSTRAINT "ProjectIndustry_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "public"."Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
