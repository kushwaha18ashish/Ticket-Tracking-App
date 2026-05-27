-- DropIndex
DROP INDEX IF EXISTS "Ticket_ticketId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_createdById_ticketId_key" ON "Ticket"("createdById", "ticketId");
