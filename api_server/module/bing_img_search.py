from bing_images import bing


def fetch_image_from_bing(query):
    urls = bing.fetch_image_urls(query, limit=1, file_type='png', filters='+filterui:aspect-square+filterui:color2-bw',
                                 extra_query_params='&first=1')

    return urls[0]


def download_image_from_bing(query, n_img, output_dir):
    bing.download_images(query,
                         n_img,
                         output_dir=output_dir,
                         pool_size=1,
                         file_type="png",
                         force_replace=True,
                         extra_query_params='&first=1')
