import { createAction, handleActions } from 'redux-actions';
import { categoryData } from '../data/homeData';
import { ImgDataByColumn } from '../data/ImgGenData';
import { DataState } from './type';

const TITLE = 'datas/TITLE';
const CATEGORY_PAYLOAD = 'datas/CATEGORY_PAYLOAD';
const IMAGE_PAYLOAD = 'datas/IMAGE_PAYLOAD';
const SEARCH_RESULT_PAYLOAD = 'datas/SEARCH_RESULT_PAYLOAD';

export const setTitle = createAction(TITLE, (title: string) => title);
export const setCategoryDataPayload = createAction(CATEGORY_PAYLOAD, (payload: any) => payload);
export const setImageDataPayload = createAction(IMAGE_PAYLOAD, (payload: any) => payload);
export const setSearchResultPayload = createAction(SEARCH_RESULT_PAYLOAD, (payload: any) => payload);

const initialDataState: DataState = {
    title: 'Our feelings',
    CategoryDataPayload: categoryData,
    ImageDataPayload: ImgDataByColumn,
    SearchResultPayload: [],
}

export const datas = handleActions<DataState>(
    {
        [TITLE]: (state: any, { payload }: any) => ({ ...state, title: payload }),
        [CATEGORY_PAYLOAD]: (state: any, { payload }: any) => ({ ...state, CategoryDataPayload: payload }),
        [IMAGE_PAYLOAD]: (state: any, { payload }: any) => ({ ...state, ImageDataPayload: payload }),
        [SEARCH_RESULT_PAYLOAD]: (state: any, { payload }: any) => ({ ...state, SearchResultPayload: payload }),
    },
    initialDataState,
)


