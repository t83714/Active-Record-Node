import CActiveRecord from "./CActiveRecord";
import CSearcher from "./CSearcher";

const setDB = (db) => {
    CActiveRecord.setDefaultConfig({db});
    CSearcher.setDefaultConfig({db});
};

export {
    CActiveRecord,
    CSearcher,
    setDB,
};
