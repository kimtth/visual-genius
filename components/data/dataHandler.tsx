
import { v4 as uuidv4 } from 'uuid';
import { DataFromBackend } from '../state/type';

export const arrangeDataToColumns = (data: any, columnNumber: number, callback: (totalImgNum: number, rowNum: number, columnNumber: number) => void) => {
    const prematureImgs = data.length > 0 ? data : [];
    // Draggable requires a [string] draggableId.
    const imgs = prematureImgs.map((img: any) => {
        img.id = img.id.toString();
        return img;
    });

    const totalImgNum = Object.keys(imgs).length;
    const rowNum = Math.ceil(totalImgNum / columnNumber);
    //console.log(totalImgNum, rowNum, columnNumber);
    callback(totalImgNum, rowNum, columnNumber);

    const dataFromBackend: DataFromBackend = {};
    for (let i = 0; i < columnNumber; i++) {
        dataFromBackend[uuidv4()] = {
            items: imgs.slice(i * rowNum, (i + 1) * rowNum),
        }
    }
    return dataFromBackend;
}

export const generateDataToColumns = (data: any, columnNumber: number, callback: (totalImgNum: number, rowNum: number, columnNumber: number) => void) => {
    const prematureImgs = data.length > 0 ? data : [];
    // Draggable requires a [string] draggableId.
    const imgs = prematureImgs.map((img: any) => {
        img.id = img.id.toString();
        return img;
    });

    const totalImgNum = Object.keys(imgs).length;
    const rowNum = Math.ceil(totalImgNum / columnNumber);
    //console.log(totalImgNum, rowNum, columnNumber);
    callback(totalImgNum, rowNum, columnNumber);

    const dataFromBackend: DataFromBackend = {};
    for (let i = 0; i < columnNumber; i++) {
        dataFromBackend[uuidv4()] = {
            items: imgs.slice(i * rowNum, (i + 1) * rowNum),
        }
    }
    return dataFromBackend;
}

