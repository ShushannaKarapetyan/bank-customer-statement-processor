import {extname} from "path";

export function getExtension(fileOriginalName: string) {
    return extname(fileOriginalName)
        .split('.')[1];
}