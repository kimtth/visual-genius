-- Database for production development

CREATE TABLE "user" (
    "user_id" VARCHAR,
    "user_password" VARCHAR,
    "user_name" VARCHAR,
    "deleteFlag" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY("user_id")
);

INSERT INTO user (user_id, user_password, user_name, created_at, updated_at)
VALUES('sys', '$2b$12$wJKDrgMaYyj24Ns2oqMz4uqw1eUXc4XT2LoYNVBf0fa3p4f6ycuZG', 'sys', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE "category" (
    "sid" VARCHAR, 
    "category" VARCHAR,
    "title" VARCHAR,
    "difficulty" VARCHAR,
    "imgNum" INTEGER,
    "user_id" VARCHAR DEFAULT 'sys',
    "deleteFlag" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY("sid")
    FOREIGN KEY("user_id") REFERENCES "user"("user_id")
);

-- ALTER TABLE "category" ADD CONSTRAINT "fk_category_user" FOREIGN KEY ("user_id") REFERENCES "user"("user_id");

CREATE TABLE "image" (
    "sid" VARCHAR,
    "categoryId" VARCHAR,
    "title" VARCHAR,
    "imgPath" VARCHAR,
    "user_id" VARCHAR DEFAULT 'sys',
    "deleteFlag" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY("sid"),
    FOREIGN KEY("categoryId") REFERENCES "category"("sid")
);

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_modtime
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_category_modtime
BEFORE UPDATE ON category
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_image_modtime
BEFORE UPDATE ON image
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

INSERT INTO public.category
(sid, category, title, difficulty, "imgNum", user_id, "deleteFlag", created_at, updated_at)
VALUES('file_upload', '-', '-', '-', 0, 'sys'::character varying, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);