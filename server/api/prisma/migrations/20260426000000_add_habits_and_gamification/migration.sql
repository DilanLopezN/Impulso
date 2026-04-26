-- CreateEnum
CREATE TYPE "HabitFrequency" AS ENUM ('DAILY', 'WEEKLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "HabitAuditAction" AS ENUM ('CREATE_CHECKIN', 'DELETE_CHECKIN', 'EDIT_HABIT', 'ARCHIVE', 'UNARCHIVE');

-- CreateEnum
CREATE TYPE "XpEventType" AS ENUM ('HABIT_CHECKIN', 'HABIT_CHECKIN_REVERTED', 'MILESTONE_COMPLETED', 'MILESTONE_REVERTED', 'GOAL_COMPLETED', 'ACHIEVEMENT_UNLOCKED', 'MANUAL_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('HABITS', 'GOALS', 'STREAKS', 'XP', 'SPECIAL');

-- CreateTable
CREATE TABLE "habits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "frequency" "HabitFrequency" NOT NULL DEFAULT 'DAILY',
    "weekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "target_per_week" INTEGER NOT NULL DEFAULT 1,
    "xp_per_checkin" INTEGER NOT NULL DEFAULT 10,
    "archived_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_checkins" (
    "id" TEXT NOT NULL,
    "habit_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "note" TEXT,
    "xp_awarded" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habit_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_audit_log" (
    "id" TEXT NOT NULL,
    "habit_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "HabitAuditAction" NOT NULL,
    "ref_date" DATE,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_ledger" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "XpEventType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "source_type" TEXT,
    "source_id" TEXT,
    "rule_version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_gamification_profile" (
    "user_id" TEXT NOT NULL,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp_into_level" INTEGER NOT NULL DEFAULT 0,
    "xp_to_next" INTEGER NOT NULL DEFAULT 100,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_gamification_profile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "icon" TEXT,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "rule" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot" JSONB,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_rate_buckets" (
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "xp_rate_buckets_pkey" PRIMARY KEY ("user_id","action","bucket")
);

-- CreateIndex
CREATE INDEX "habits_user_id_idx" ON "habits"("user_id");

-- CreateIndex
CREATE INDEX "habits_user_id_archived_at_idx" ON "habits"("user_id", "archived_at");

-- CreateIndex
CREATE INDEX "habits_user_id_deleted_at_idx" ON "habits"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "habit_checkins_user_id_date_idx" ON "habit_checkins"("user_id", "date");

-- CreateIndex
CREATE INDEX "habit_checkins_habit_id_date_idx" ON "habit_checkins"("habit_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "habit_checkins_habit_id_date_key" ON "habit_checkins"("habit_id", "date");

-- CreateIndex
CREATE INDEX "habit_audit_log_habit_id_created_at_idx" ON "habit_audit_log"("habit_id", "created_at");

-- CreateIndex
CREATE INDEX "habit_audit_log_user_id_created_at_idx" ON "habit_audit_log"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "xp_ledger_user_id_occurred_at_idx" ON "xp_ledger"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "xp_ledger_user_id_type_idx" ON "xp_ledger"("user_id", "type");

-- CreateIndex
CREATE INDEX "xp_ledger_source_type_source_id_idx" ON "xp_ledger"("source_type", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "xp_ledger_user_id_idempotency_key_key" ON "xp_ledger"("user_id", "idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE INDEX "user_achievements_user_id_unlocked_at_idx" ON "user_achievements"("user_id", "unlocked_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE INDEX "xp_rate_buckets_user_id_action_idx" ON "xp_rate_buckets"("user_id", "action");

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_checkins" ADD CONSTRAINT "habit_checkins_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_checkins" ADD CONSTRAINT "habit_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_audit_log" ADD CONSTRAINT "habit_audit_log_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_audit_log" ADD CONSTRAINT "habit_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_ledger" ADD CONSTRAINT "xp_ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_gamification_profile" ADD CONSTRAINT "user_gamification_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_rate_buckets" ADD CONSTRAINT "xp_rate_buckets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
