CREATE TABLE "category" (
	"id"	INTEGER,
	"category"	TEXT,
	"title"	TEXT,
	"difficulty"	TEXT,
	"imgNum"	INTEGER,
	"contentUrl"	BLOB,
	"user_id"	TEXT DEFAULT 'sys',
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "image" (
	"id"	INTEGER,
	"categoryId"	TEXT,
	"title"	TEXT,
	"imgPath"	TEXT,
	"user_id"	TEXT DEFAULT 'sys',
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("categoryId") REFERENCES "category"("id")
);