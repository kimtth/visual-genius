import { createAction, handleActions } from 'redux-actions';
import { SettingState } from './type';

const SHOW_IMG_DESC = 'settings/SHOW_IMG_DESC';

export const showImgDescription = createAction(SHOW_IMG_DESC);

const initialSettingState: SettingState = {
    showImgDesc: true,
}

export const settings = handleActions<SettingState>(
    {
        [SHOW_IMG_DESC]: (state: any) => ({ ...state, showImgDesc: !state.showImgDesc })
    },
    initialSettingState,
)


