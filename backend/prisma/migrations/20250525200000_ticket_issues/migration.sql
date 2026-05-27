-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- AlterEnum
ALTER TYPE "ActivityAction" ADD VALUE 'ISSUE_LOGGED';
ALTER TYPE "ActivityAction" ADD VALUE 'ISSUE_UPDATED';
ALTER TYPE "ActivityAction" ADD VALUE 'ISSUE_REMOVED';

-- CreateTable
CREATE TABLE "TicketIssue" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "notes" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketIssue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TicketIssue" ADD CONSTRAINT "TicketIssue_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketIssue" ADD CONSTRAINT "TicketIssue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
