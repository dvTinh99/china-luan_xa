CREATE TABLE "pinyin_stage_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "best_score" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pinyin_stage_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pinyin_stage_progress_user_id_stage_id_key"
ON "pinyin_stage_progress"("user_id", "stage_id");

CREATE INDEX "pinyin_stage_progress_user_id_idx"
ON "pinyin_stage_progress"("user_id");

ALTER TABLE "pinyin_stage_progress"
ADD CONSTRAINT "pinyin_stage_progress_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
