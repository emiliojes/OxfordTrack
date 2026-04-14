/*
  Warnings:

  - Added the required column `grade` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'SUMMATIVE',
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("createdAt", "createdBy", "date", "description", "id", "published", "subject", "time", "title", "updatedAt", "grade", "section", "eventType") SELECT "createdAt", "createdBy", "date", "description", "id", "published", "subject", "time", "title", "updatedAt", 9, 'A', 'SUMMATIVE' FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
