from dotenv import load_dotenv
from azure.storage.blob import BlobServiceClient
import os
import json
import uuid
import sqlite3

# Set the directory path
dir_path = '../data'

# Get a list of all files in the directory
file_list = os.listdir(dir_path)

load_dotenv(verbose=False)
connection_string = os.getenv("BLOB_CONNECTION_STRING")
container_name = os.getenv("BLOB_CONTAINER_NAME")
blob_service_client = BlobServiceClient.from_connection_string(connection_string)

# Connect to the SQLite database
conn = sqlite3.connect('../db.db')


def insert_data(conn, table_name, data):
    """
    Insert data into a table in an SQLite database.

    :param conn: A connection object to the SQLite database.
    :param table_name: The name of the table to insert data into.
    :param data: A list of dictionaries, where each dictionary represents a row to be inserted into the table.
    """
    # Get the column names from the first row of data
    columns = ', '.join(data[0].keys())

    # Create the placeholders for the values
    placeholders = ', '.join(['?'] * len(data[0]))

    # Create the SQL query
    query = f'INSERT INTO {table_name} ({columns}) VALUES ({placeholders})'

    # Extract the values from the data
    values = [tuple(row.values()) for row in data]

    # Execute the query
    conn.executemany(query, values)
    conn.commit()


def update_category(conn):
    """
    Update the imgNum and contentUrl columns of the category table based on information from the image table.

    :param conn: A connection object to the SQLite database.
    """
    # Create a cursor object
    cursor = conn.cursor()

    # Query to get the number of images and the first 3 image paths for each category
    query = '''
        SELECT c.sid, COUNT(i.sid)
        FROM category c
        LEFT JOIN image i ON c.sid = i.categoryId
        GROUP BY c.sid
    '''

    # Execute the query
    cursor.execute(query)

    # Fetch the results
    results = cursor.fetchall()

    # Update the category table
    for row in results:
        category_id = row[0]
        img_num = row[1]

        # Update query
        update_query = '''
            UPDATE category
            SET imgNum = ?, contentUrl = ?
            WHERE sid = ?
        '''

        # Execute the update query
        cursor.execute(update_query, (img_num, content_url, category_id))

    # Commit changes
    conn.commit()


def get_cls_id(i):
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
        'imgPath': blob_url
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
        'imgPath': blob_url
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

category_data = [cls_1, cls_2, cls_3, cls_4, cls_5, cls_6]
# Insert data into the category table
insert_data(conn, 'category', category_data)
# Insert data into the image table
insert_data(conn, 'image', image_list_1)
insert_data(conn, 'image', image_list_2)

# Update the category table
update_category(conn)

# Commit changes and close connection
conn.commit()
conn.close()
