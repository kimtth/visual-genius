export interface DataState {
    title: string;
    CategoryData: any;
    CategoriesDataPayload: any;
    ImageDataPayload: any;
    SearchResultPayload: any;
}

export interface SettingState {
    showImgCaption: boolean;
    showTextSpeech: boolean;
    showGenButton: boolean;
    setUrlPathMemo: string;
    setImageNumber: number;
    setRowNumber: number;
    setColumnNumber: number;
}

export interface DataFromBackend {
    [key: string]: {
        items: any[];
    };
}