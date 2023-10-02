-- Local Database for development - As of now, Do not need to use this file.

CREATE TABLE "category" (
	"sid" TEXT, 
	"category"	TEXT,
	"title"	TEXT,
	"difficulty"	TEXT,
	"imgNum"	INTEGER,
	"user_id"	TEXT DEFAULT 'sys',
	"deleteFlag" INTEGER DEFAULT 0,
	"created_at" TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    "updated_at" TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
	PRIMARY KEY("sid")
);

CREATE TRIGGER trigger_category_updated_at AFTER UPDATE ON "category"
BEGIN
    UPDATE "category" SET updated_at = DATETIME('now', 'localtime') WHERE rowid == NEW.rowid;
END;

CREATE TABLE "image" (
	"sid" TEXT,
	"categoryId"	TEXT,
	"title"	TEXT,
	"imgPath"	TEXT,
	"user_id"	TEXT DEFAULT 'sys',
	"deleteFlag" INTEGER DEFAULT 0,
	"created_at" TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    "updated_at" TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
	PRIMARY KEY("sid"),
	FOREIGN KEY("categoryId") REFERENCES "category"("sid")
);

CREATE TRIGGER trigger_image_updated_at AFTER UPDATE ON "image"
BEGIN
    UPDATE "image" SET updated_at = DATETIME('now', 'localtime') WHERE rowid == NEW.rowid;
END;