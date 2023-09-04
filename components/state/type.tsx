export interface DataState {
    title: string;
    CategoryDataPayload: any;
    ImageDataPayload: any;
    SearchResultPayload: any;
}

export interface SettingState {
    showImgCaption: boolean;
    setImageNumber: number;
    setRowNumber: number;
    setColumnNumber: number;
}

export interface DataFromBackend {
    [key: string]: {
        items: any[];
    };
}