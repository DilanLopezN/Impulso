-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('HABIT', 'DEADLINE', 'NUMERIC', 'PROJECT');

-- CreateEnum
CREATE TYPE "GoalFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "type" "GoalType" NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "deadline" TIMESTAMP(3),
    "target_value" DOUBLE PRECISION,
    "target_unit" TEXT,
    "frequency" "GoalFrequency",
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "archived_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "done" BOOLEAN NOT NULL DEFAULT false,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goals_user_id_idx" ON "goals"("user_id");

-- CreateIndex
CREATE INDEX "goals_user_id_archived_at_idx" ON "goals"("user_id", "archived_at");

-- CreateIndex
CREATE INDEX "goals_user_id_deleted_at_idx" ON "goals"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "milestones_goal_id_idx" ON "milestones"("goal_id");

-- CreateIndex
CREATE INDEX "milestones_goal_id_order_idx" ON "milestones"("goal_id", "order");

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
