import os
import uuid
import psycopg2
from dotenv import load_dotenv
from azure.storage.blob import BlobServiceClient

# Set the directory path
dir_path = 'dataset'
print(os.path.abspath(dir_path))

# Get a list of all files in the directory
file_list = os.listdir(dir_path)

load_dotenv(verbose=False)
connection_string = os.getenv("POSTGRES_CONNECTION_STRING")
container_name = os.getenv("BLOB_CONTAINER_NAME")
blob_service_client = BlobServiceClient.from_connection_string(connection_string)

# Connect to the PostgreSQL database
conn = psycopg2.connect(connection_string)

def insert_data(conn, table_name, data):
    # Get the column names from the first row of data
    columns = ', '.join(data[0].keys())

    # Create the placeholders for the values
    placeholders = ', '.join(['%s'] * len(data[0].keys()))

    # Build the SQL query
    sql = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"

    # Insert the data into the table
    with conn, conn.cursor() as cur:
        values = [tuple(row.values()) for row in data]
        cur.executemany(sql, values)


def update_category(conn):
    """
    Update the imgNum column of the category table based on information from the image table.

    :param conn: A connection object to the PostgreSQL database.
    """
    # Build the SQL query
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

    # Execute the query
    with conn, conn.cursor() as cur:
        cur.execute(sql)


def get_cls_id(i, file_name):
    cls_id = i // 20
    if 'val2017' in file_name:
        cls_id = cls_id + 4
    else:
        cls_id = cls_id + 1

    return cls_id


cls_animal = [x for x in file_list if 'val2017' not in x]
cls_everyday_life = [x for x in file_list if 'val2017' in x]

category_id_list = []

image_list_1 = []
cls_id = 0
cls_uuid = str(uuid.uuid4())
category_id_list.append(cls_uuid)
prev_cls_id = 0

for i, file_name in enumerate(cls_animal):
    # Split the file name into animal name and id
    img_name, img_idx = file_name.split("_")
    # Remove the file extension from the id
    img_idx = img_idx.split(".")[0]

    # Get the primary blob service endpoint for your storage account
    primary_endpoint = f"https://{blob_service_client.account_name}.blob.core.windows.net"
    # Construct the URL for the blob
    blob_url = f"{primary_endpoint}/{container_name}/{file_name}"

    cls_id = i // 20
    if cls_id != prev_cls_id:
        cls_uuid = str(uuid.uuid4())
        category_id_list.append(cls_uuid)
    # Create a dictionary for the image
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

    # Get the primary blob service endpoint for your storage account
    primary_endpoint = f"https://{blob_service_client.account_name}.blob.core.windows.net"
    # Construct the URL for the blob
    blob_url = f"{primary_endpoint}/{container_name}/{file_name}"

    cls_id = i // 20
    if cls_id != prev_cls_id:
        cls_uuid = str(uuid.uuid4())
        category_id_list.append(cls_uuid)
    # Create a dictionary for the image
    image_dict = {
        'sid': str(uuid.uuid4()),
        'title': img_name.title(),
        'categoryId': cls_uuid,  # get_cls_id(i, file_name),
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
    # Create a list of dictionaries
    category_data = [cls_1, cls_2, cls_3, cls_4, cls_5, cls_6]
    # Insert data into the category table
    insert_data(conn, 'category', category_data)
    # Insert data into the image table
    insert_data(conn, 'image', image_list_1)
    insert_data(conn, 'image', image_list_2)

    # Update the category table
    update_category(conn)

    conn.close()

