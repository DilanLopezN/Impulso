-- CreateTable
CREATE TABLE "ranking_snapshots" (
    "id" BIGSERIAL NOT NULL,
    "period" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_snapshot_entries" (
    "snapshot_id" BIGINT NOT NULL,
    "period" TEXT NOT NULL,
    "snapshot_generated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "total_xp" INTEGER NOT NULL,
    "checkins_count" INTEGER NOT NULL,
    "last_activity_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ranking_snapshot_entries_pkey" PRIMARY KEY ("snapshot_id", "user_id")
);

-- CreateTable
CREATE TABLE "user_friendships" (
    "user_id" TEXT NOT NULL,
    "friend_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'accepted',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_friendships_pkey" PRIMARY KEY ("user_id", "friend_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_memberships" (
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("team_id", "user_id")
);

-- CreateIndex
CREATE INDEX "ranking_snapshots_period_generated_at_idx" ON "ranking_snapshots"("period", "generated_at" DESC);

-- CreateIndex
CREATE INDEX "ranking_snapshot_entries_period_snapshot_generated_at_position_idx" ON "ranking_snapshot_entries"("period", "snapshot_generated_at" DESC, "position");

-- CreateIndex
CREATE INDEX "ranking_snapshot_entries_user_id_idx" ON "ranking_snapshot_entries"("user_id");

-- CreateIndex
CREATE INDEX "user_friendships_friend_id_status_idx" ON "user_friendships"("friend_id", "status");

-- CreateIndex
CREATE INDEX "team_memberships_user_id_idx" ON "team_memberships"("user_id");

-- AddForeignKey
ALTER TABLE "ranking_snapshot_entries" ADD CONSTRAINT "ranking_snapshot_entries_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "ranking_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_snapshot_entries" ADD CONSTRAINT "ranking_snapshot_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_friendships" ADD CONSTRAINT "user_friendships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_friendships" ADD CONSTRAINT "user_friendships_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
