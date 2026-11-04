-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedDates" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);
