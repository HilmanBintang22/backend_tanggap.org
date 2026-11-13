CREATE TYPE "Gender" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

ALTER TABLE "users"
ADD COLUMN "gender" "Gender";

CREATE TABLE "classrooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school_name" TEXT,
    "code" VARCHAR(6) NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "class_memberships" (
    "user_id" TEXT NOT NULL,
    "classroom_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_memberships_pkey" PRIMARY KEY ("user_id", "classroom_id")
);

CREATE UNIQUE INDEX "classrooms_code_key" ON "classrooms"("code");
CREATE INDEX "class_memberships_classroom_id_idx" ON "class_memberships"("classroom_id");

ALTER TABLE "classrooms"
ADD CONSTRAINT "classrooms_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "class_memberships"
ADD CONSTRAINT "class_memberships_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "class_memberships"
ADD CONSTRAINT "class_memberships_classroom_id_fkey"
FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
