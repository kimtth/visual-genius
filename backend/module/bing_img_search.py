import logging
import os
from io import BytesIO
from PIL import Image
from bing_image_urls import bing_image_urls
from dotenv import load_dotenv

r"""
bing_image_urls

https://github.com/gurugaurav/bing_image_downloader
based on https://github.com/gurugaurav/bing_image_downloader/blob/master/bing_image_downloader/bing.py

"""

from typing import Iterator, List, Union  # , Optional

import asyncio

# import urllib
import httpx


load_dotenv(verbose=False)
bing_search_subscription_key = os.getenv("BING_IMAGE_SEARCH_KEY")

# fmt: off
async def bing_image_urls(  # pylint: disable=too-many-locals
        query: str,
        page_counter: int = 0,
        limit: int = 20,
        adult_filter_off: bool = False,
        verify_status_only: bool = None,
        filters: str = "",
) -> List[str]:
    # fmt: on
    """ fetch bing image links.

    verify_status_only:
        None (default): no check at all
        True: check status_code == 20
        False: check imghrd.what(None, content) == jpeg|png|etc

    based on https://github.com/gurugaurav/bing_image_downloader/blob/master/bing_image_downloader/bing.py

    query = "bear"
    """

    try:
        count = int(limit)
    except Exception:
        count = 20

    adult = "on"
    if adult_filter_off:
        adult = "off"

    data = {
        "q": query,
        "first": page_counter,
        "count": count,
        "adlt": adult,
        # +filterui:aspect-square
        "qft": "+filterui:imagesize-medium+filterui:color2-color+filterui:photo-photo+filterui:minFileSize-1024+filterui:maxFileSize-1048576",
    }

    search_url = "https://api.bing.microsoft.com/v7.0/images/search"
    headers = {"Ocp-Apim-Subscription-Key": bing_search_subscription_key}

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(search_url, headers=headers, params=data)
            resp.raise_for_status()
    except Exception as exc:
        print(exc)
        raise

    try:
        # links = re.findall(r"murl&quot;:&quot;(.*?)&quot;", resp.text)
        search_results = resp.json()["value"]
        links = [url["contentUrl"] for url in search_results]
    except Exception as exc:
        print(exc)
        raise

    if verify_status_only is None:  # do not check at all
        return links

    loop = asyncio.get_event_loop()

    if verify_status_only:  # staus_only
        bool_ = [*loop.run_until_complete(verify_status(links))]
    else:  # verify imghdr
        bool_ = loop.run_until_complete(verify_links(links))

    _ = [elm for idx, elm in enumerate(links) if bool_[idx]]
    return _


async def verify_status(links: List[str]) -> Union[Iterator[bool], List[bool]]:
    """ verify status_code. """
    async with httpx.AsyncClient() as sess:
        coros = (sess.head(link) for link in links)
        res = await asyncio.gather(*coros)

        def check_status_code(elm):
            if elm.status_code not in (200,):
                return False
            return True

    return map(check_status_code, res)


async def verify_links(links: List[str]) -> List[bool]:
    """ verify link hosts image content. """
    res = []
    async with httpx.AsyncClient() as sess:
        futs = (asyncio.ensure_future(sess.get(link)) for link in links)

        for fut in asyncio.as_completed([*futs], timeout=120):
            try:
                resp = await fut
                # Verify whether the Image link is broken.
                img = Image.open(BytesIO(resp.content))
                img.verify()
                # res.append(resp)
                res.append(img.format is not None)
            except Exception:
                # res.append(None)
                res.append(False)

        # Deprecated since version 3.11, will be removed in version 3.13: The imghdr module is deprecated
        # res.append(img.format is not None)
        # _ = [imghdr.what(None, elm.content)
        #      if elm is not None else elm for elm in res]
    # await sess.aclose()
    return res # [bool(elm) for elm in _]


async def fetch_image_from_bing(query, limit=1):
    urls = await bing_image_urls(query, limit=limit)

    if limit == 1 and len(urls) >= 1:
        return urls[0]
    
    if limit == 1 and len(urls) == 0:
        return ""
    
    if limit > 1 and len(urls) > 0:
        return urls
    else:
        return []
