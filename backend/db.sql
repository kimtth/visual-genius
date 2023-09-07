CREATE TABLE "category" (
	"id" TEXT,
	"category"	TEXT,
	"title"	TEXT,
	"difficulty"	TEXT,
	"imgNum"	INTEGER,
	"contentUrl"	TEXT,
	"user_id"	TEXT DEFAULT 'sys',
	"deleteFlag" INTEGER DEFAULT 0,
	"created_at" TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    "updated_at" TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
	PRIMARY KEY("id")
);

CREATE TRIGGER trigger_category_updated_at AFTER UPDATE ON "category"
BEGIN
    UPDATE "category" SET updated_at = DATETIME('now', 'localtime') WHERE rowid == NEW.rowid;
END;

CREATE TABLE "image" (
	"id" TEXT,
	"categoryId"	TEXT,
	"title"	TEXT,
	"imgPath"	TEXT,
	"user_id"	TEXT DEFAULT 'sys',
	"deleteFlag" INTEGER DEFAULT 0,
	"created_at" TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    "updated_at" TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
	PRIMARY KEY("id"),
	FOREIGN KEY("categoryId") REFERENCES "category"("id")
);

CREATE TRIGGER trigger_image_updated_at AFTER UPDATE ON "image"
BEGIN
    UPDATE "image" SET updated_at = DATETIME('now', 'localtime') WHERE rowid == NEW.rowid;
END;