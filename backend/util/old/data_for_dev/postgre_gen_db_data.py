import os
import argparse
import psycopg2
import uuid
# Removed unused import: load_dotenv
from azure.storage.blob import BlobServiceClient

def insert_data(conn, table_name, data):
    columns = ', '.join(data[0].keys())
    placeholders = ', '.join(['%s'] * len(data[0].keys()))
    sql = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
    with conn, conn.cursor() as cur:
        values = [tuple(row.values()) for row in data]
        cur.executemany(sql, values)

def update_category(conn):
    sql = '''
        UPDATE category
        SET imgNum = subquery.img_num
        FROM (
            SELECT categoryId, COUNT(*) AS img_num
            FROM image
            GROUP BY categoryId
        ) AS subquery
        WHERE category.sid = subquery.categoryId
    '''
    with conn, conn.cursor() as cur:
        cur.execute(sql)

def main():
    parser = argparse.ArgumentParser(description='Generate data for development environment')
    parser.add_argument('--postgres-host', type=str, required=True, help='PostgreSQL host')
    parser.add_argument('--postgres-db', type=str, required=True, help='PostgreSQL database name')
    parser.add_argument('--postgres-user', type=str, required=True, help='PostgreSQL user')
    parser.add_argument('--postgres-password', type=str, required=True, help='PostgreSQL password')
    parser.add_argument('--blob-connection-string', type=str, required=True, help='Azure Blob connection string')
    parser.add_argument('--blob-container-name', type=str, required=True, help='Azure Blob container name')
    args = parser.parse_args()

    connection_string = f"dbname={args.postgres_db} user={args.postgres_user} password={args.postgres_password} host={args.postgres_host}"
    container_name = args.blob_container_name
    blob_service_client = BlobServiceClient.from_connection_string(args.blob_connection_string)

    conn = psycopg2.connect(connection_string)

    dir_path = 'dataset'
    print(os.path.abspath(dir_path))

    file_list = os.listdir(dir_path)

    cls_animal = [x for x in file_list if 'val2017' not in x]
    cls_everyday_life = [x for x in file_list if 'val2017' in x]

    category_id_list = []

    image_list_1 = []
    cls_id = 0
    cls_uuid = str(uuid.uuid4())
    category_id_list.append(cls_uuid)
    prev_cls_id = 0

    for i, file_name in enumerate(cls_animal):
        img_name, img_idx = file_name.split("_")
        img_idx = img_idx.split(".")[0]

        primary_endpoint = f"https://{blob_service_client.account_name}.blob.core.windows.net"
        blob_url = f"{primary_endpoint}/{container_name}/{file_name}"

        cls_id = i // 20
        if cls_id != prev_cls_id:
            cls_uuid = str(uuid.uuid4())
            category_id_list.append(cls_uuid)
        image_dict = {
            'sid': str(uuid.uuid4()),
            'title': img_name.title(),
            'categoryId': cls_uuid,
            'imgPath': blob_url,
            'user_id': 'sys'
        }

        prev_cls_id = cls_id
        image_list_1.append(image_dict)

    print("#1")
    print(image_list_1)
    print(len(image_list_1))

    image_list_2 = []
    for i, file_name in enumerate(cls_everyday_life):
        img_name = file_name.split(".")[0]

        primary_endpoint = f"https://{blob_service_client.account_name}.blob.core.windows.net"
        blob_url = f"{primary_endpoint}/{container_name}/{file_name}"

        cls_id = i // 20
        if cls_id != prev_cls_id:
            cls_uuid = str(uuid.uuid4())
            category_id_list.append(cls_uuid)
        image_dict = {
            'sid': str(uuid.uuid4()),
            'title': img_name.title(),
            'categoryId': cls_uuid,
            'imgPath': blob_url,
            'user_id': 'sys'
        }

        prev_cls_id = cls_id
        image_list_2.append(image_dict)

    print("#2")
    print(image_list_2)
    print(len(image_list_2))

    cls_1 = {
        'sid': category_id_list[0],
        'category': 'Object Recognition',
        'title': 'Animals #1',
        'difficulty': 'Easy',
        'imgNum': 8,
    }

    cls_2 = {
        'sid': category_id_list[1],
        'category': 'Object Recognition',
        'title': 'Animals #2',
        'difficulty': 'Medium',
        'imgNum': 8,
    }

    cls_3 = {
        'sid': category_id_list[2],
        'category': 'Object Recognition',
        'title': 'Animals #3',
        'difficulty': 'Easy',
        'imgNum': 8,
    }

    cls_4 = {
        'sid': category_id_list[3],
        'category': 'Pattern Recognition',
        'title': 'Everyday Life',
        'difficulty': 'Medium',
        'imgNum': 8,
    }

    cls_5 = {
        'sid': category_id_list[4],
        'category': 'Pattern Recognition',
        'title': 'Everyday Life',
        'difficulty': 'Medium',
        'imgNum': 8,
    }

    cls_6 = {
        'sid': category_id_list[5],
        'category': 'Pattern Recognition',
        'title': 'Everyday Life',
        'difficulty': 'Medium',
        'imgNum': 8,
    }

if __name__ == '__main__':
    main()
