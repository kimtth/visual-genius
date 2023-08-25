import os
import random
import shutil


def select_images(root_dir, num_images):
    images = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.jpg') or filename.endswith('.png'):
                images.append(os.path.join(dirpath, filename))
    selected_images = random.sample(images, min(num_images, len(images)))
    return [os.path.join(root_dir, image) for image in selected_images]


def copy_images(selected_images, dest_dir):
    for image_path in selected_images:
        print(rename_file(image_path))
        img_dest_path = os.path.join(dest_dir, rename_file(image_path))
        shutil.copy(image_path, img_dest_path)


def rename_file(path):
    parts = path.split("\\")
    new_filename = parts[-2] + '_' + parts[-1]
    return new_filename


if __name__ == '__main__':
    dest_dir = os.path.join(os.path.curdir, "../data")

    root_dir = r'.\val2017'
    num_images = 10
    selected_images = select_images(root_dir, num_images)
    copy_images(selected_images, dest_dir)
