import CActiveRecordRef from "./CActiveRecord";
import CSearcherRef from "./CSearcher";

export const setDB = (db) => {
    CActiveRecordRef.setDefaultConfig({db});
    CSearcherRef.setDefaultConfig({db});
};

export const CActiveRecord = CActiveRecordRef;
export const CSearcher = CSearcherRef;
