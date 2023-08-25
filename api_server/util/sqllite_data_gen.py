import sqlite3

connection = sqlite3.connect('demo.db', check_same_thread=False)
cursor = connection.cursor()
cursor.execute('Create Table if not exists Item (id INTEGER PRIMARY KEY AUTOINCREMENT, title varchar(10), '
               'images Text, user_id varchar(100))')

init_data = [
    {
        'title': 'Fruit',
        'images': '[{ "id": "1", "title": "Lemon", "img_url": "https://cdn.britannica.com/84/188484-050-F27B0049/lemons-tree.jpg" },'
                  '{ "id": "2", "title": "Apple", "img_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/The_SugarBee_Apple_now_grown_in_Washington_State.jpg/240px-The_SugarBee_Apple_now_grown_in_Washington_State.jpg" }, '
                  '{ "id": "3", "title": "Fruits", "img_url": "https://image.sciencenorway.no/1438480.jpg" }, '
                  '{ "id": "4", "title": "Strawberry", "img_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Garden_strawberry_%28Fragaria_%C3%97_ananassa%29_single2.jpg/1200px-Garden_strawberry_%28Fragaria_%C3%97_ananassa%29_single2.jpg" }, '
                  '{ "id": "5", "title": "Banana", "img_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Bananas_white_background_DS.jpg/220px-Bananas_white_background_DS.jpg" }]',
        'user_id': 'sys'
    },
    {
        'title': 'Car',
        'images': '[{ "id": "1", "title": "Truck", "img_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Freightliner_Business_Class_M2_box_rigid.jpg/1200px-Freightliner_Business_Class_M2_box_rigid.jpg" }, '
                  '{ "id": "2", "title": "Car", "img_url": "https://cdn.britannica.com/74/56174-004-A230DBF6.gif" }, '
                  '{ "id": "3", "title": "Pickup", "img_url": "https://upload.wikimedia.org/wikipedia/commons/0/02/Ford_F-150_crew_cab_--_05-28-2011.jpg" }, '
                  '{ "id": "4", "title": "SUV", "img_url": "https://upload.wikimedia.org/wikipedia/commons/5/50/2010_Ford_Flex_Limited_1_--_11-25-2009.jpg" }, '
                  '{ "id": "5", "title": "CamperVan", "img_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/White_Fiat_Ducato_Campervan_2006.jpg/2560px-White_Fiat_Ducato_Campervan_2006.jpg" }, '
                  '{ "id": "6", "title": "Jeep", "img_url": "https://cdn.britannica.com/63/142063-050-602D2DD5/jeep-Willys-MB-World-War-II.jpg" }]',
        'user_id': 'sys'
    },
    {
        'title': 'Train',
        'images': '[{ "id": "1", "title": "Thomas train", "img_url": "https://upload.wikimedia.org/wikipedia/en/d/dc/Thomas_Tank_Engine_1.JPG" }, '
                  '{ "id": "2", "title": "Yamanote", "img_url": "https://upload.wikimedia.org/wikipedia/commons/6/64/Yamanote-Line-E235.jpg" }, '
                  '{ "id": "1", "title": "Metro", "img_url": "https://upload.wikimedia.org/wikipedia/commons/0/07/Tokyo-Metro-9000_Toei-6300.jpg" }, '
                  '{ "id": "1", "title": "Amtrak", "img_url": "https://www.amtrak.com/content/dam/projects/dotcom/english/public/images/heros/hero-train-southwest-scenic-landscape.jpg/_jcr_content/renditions/cq5dam.web.900.450.jpeg" }, '
                  '{ "id": "1", "title": "Percy train", "img_url": "https://static.wikia.nocookie.net/thomas-the-tank-engine-series-100/images/4/48/Percy.png" }, '
                  '{ "id": "3", "title": "Shinkansen", "img_url": "https://en.wikipedia.org/wiki/Tokaido_Shinkansen#/media/File:Series-N700S-J2.jpg" }]',
        'user_id': 'sys'
    },
    {
        'title': 'Nature',
        'images': '[{ "id": "1", "title": "Flower", "img_url": "https://images.pexels.com/photos/954046/pexels-photo-954046.jpeg" }, '
                  '{ "id": "2", "title": "Nature", "img_url": "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg" }, '
                  '{ "id": "3", "title": "Lake", "img_url": "https://images.pexels.com/photos/1062249/pexels-photo-1062249.jpeg" }, '
                  '{ "id": "4", "title": "Sea", "img_url": "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg" }, '
                  '{ "id": "5", "title": "Aurora", "img_url": "https://images.pexels.com/photos/624015/pexels-photo-624015.jpeg" }, '
                  '{ "id": "6", "title": "Winter", "img_url": "https://images.pexels.com/photos/235621/pexels-photo-235621.jpeg" }, '
                  '{ "id": "7", "title": "Mountain", "img_url": "https://images.pexels.com/photos/2223082/pexels-photo-2223082.jpeg" }]',
        'user_id': 'sys'
    }]

for data in init_data:
    cursor.execute("insert into Item (title, images, user_id) values (?, ?, ?)",
                   [data['title'], data['images'], data['user_id']])
    connection.commit()
