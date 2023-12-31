import { createAction, handleActions } from 'redux-actions';
import { SettingState } from './type';

const SHOW_IMG_CAPTION = 'settings/SHOW_IMG_CAPTION';
const SHOW_TEXT_SPEECH = 'settings/SHOW_TEXT_SPEECH';
const SHOW_NUMBERING = 'settings/SHOW_NUMBERING';
const SET_IMG_NUMBER = 'settings/SET_IMG_NUMBER';
const SET_ROW_NUMBER = 'settings/SET_ROW_NUMBER';
const SET_COLUMN_NUMBER = 'settings/SET_COLUMN_NUMBER';

export const showImgCaption = createAction(SHOW_IMG_CAPTION);
export const showTextSpeech = createAction(SHOW_TEXT_SPEECH);
export const showNumbering = createAction(SHOW_NUMBERING);
export const setImageNumber = createAction(SET_IMG_NUMBER);
export const setRowNumber = createAction(SET_ROW_NUMBER);
export const setColumnNumber = createAction(SET_COLUMN_NUMBER);

const initialSettingState: SettingState = {
    showImgCaption: true,
    showTextSpeech: false,
    showNumbering: false,
    setImageNumber: 1,
    setRowNumber: 1,
    setColumnNumber: 4
}

export const settings = handleActions<SettingState>(
    {
        [SHOW_IMG_CAPTION]: (state: any) => ({ ...state, showImgCaption: !state.showImgCaption }),
        [SHOW_TEXT_SPEECH]: (state: any) => ({ ...state, showTextSpeech: !state.showTextSpeech }),
        [SHOW_NUMBERING]: (state: any) => ({ ...state, showNumbering: !state.showNumbering }),
        [SET_IMG_NUMBER]: (state: any, { payload }: any) => ({ ...state, setImageNumber: payload }),
        [SET_ROW_NUMBER]: (state: any, { payload }: any) => ({ ...state, setRowNumber: payload }),
        [SET_COLUMN_NUMBER]: (state: any, { payload }: any) => ({ ...state, setColumnNumber: payload })
    },
    initialSettingState,
)
