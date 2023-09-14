-- Database for production development

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
);

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