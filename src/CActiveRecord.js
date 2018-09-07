/**
 * @author Jacky Jiang
 * @class CActiveRecord
 * @description CActiveRecord class for ORM; 2017
 */
import util from "util";
import * as proxyHandlerSymbols from "./proxyHandlerSymbols";
import createDefaultProxy from "./createDefaultProxy";

const defaultConfig = {
    initData: null,
    primaryKeys: ["id"],
    db: null,
    debug: false
};

class CActiveRecord {
    constructor(tableName, options = null) {
        const config = {};

        if (options) Object.assign(config, defaultConfig, options);
        else Object.assign(config, defaultConfig);

        this.db = config.db;

        if (!this.db)
            throw new Error("Cannot locate db obj from config options");

        if (!tableName || typeof tableName !== "string")
            throw new Error("invalid parameter: tableName");
        this.data = {};
        this.primaryKeys = config.primaryKeys;
        this.tableName = tableName.trim();

        this.isNewRecord = true;
        this.updatedFields = [];

        if (config.initData && typeof config.initData === "object") {
            Object.assign(this.data, config.initData);
            this.isNewRecord = false;
        }
        this.debug = config.debug;
    }

    get(property) {
        return this[proxyHandlerSymbols.get](property);
    }

    set(property, value) {
        this[proxyHandlerSymbols.set](property, value);
    }

    [util.inspect.custom](depth, opts) {
        return this.data;
    }

    [proxyHandlerSymbols.get](property) {
        return this.data[property];
    }

    [proxyHandlerSymbols.set](property, value) {
        if (this.primaryKeys.indexOf(property) !== -1)
            throw new Error(`Primary key \`${property}\` cannot be updated!`);
        if (typeof value === "object")
            this.data[property] = JSON.stringify(value);
        else this.data[property] = value;
        this.updatedFields.push(property);
    }

    [proxyHandlerSymbols.has](property) {
        if (typeof this.data[property] === "undefined") return false;
        else return true;
    }

    [proxyHandlerSymbols.ownKeys](target) {
        return Object.keys(target.data);
    }

    [proxyHandlerSymbols.getOwnPropertyDescriptor](target, prop) {
        return Object.getOwnPropertyDescriptor(target.data, prop);
    }

    [proxyHandlerSymbols.deleteProperty](property) {
        this.set(property, null);
    }

    async delete() {
        const params = [];
        const conditions = [];
        this.primaryKeys.forEach(pk => {
            conditions.push("`" + pk + "` = ?");
            params.push(this.data[pk]);
        });

        const sql =
            "DELETE FROM `" +
            this.tableName +
            "` WHERE " +
            conditions.join(" AND ") +
            " LIMIT 1";
        if (this.debug) {
            console.log([sql, params]);
        }
        return this.db.execute(sql, params);
    }

    async commit() {
        const insertNewRecord = async () => {
            const params = [];
            const values = [];
            const fields = Object.keys(this.data);
            fields.forEach(key => {
                let value = this.data[key];
                if (typeof value === "undefined") value = null;
                params.push(value);
                values.push("?");
            });
            const sql =
                "INSERT INTO `" +
                this.tableName +
                "` (" +
                fields.join(",") +
                ") VALUES (" +
                values.join(",") +
                ")";
            if (this.debug) {
                console.log([sql, params]);
            }
            return this.db.execute(sql, params).then(([rows, fields]) => {
                return rows.insertId;
            });
        };

        const updateRecord = async () => {
            const params = [];
            const setValues = [];
            const fields = this.updatedFields;

            fields.forEach(key => {
                let value = this.data[key];
                if (typeof value === "undefined") value = null;
                params.push(value);
                setValues.push("`" + key + "` = ?");
            });

            const conditions = [];
            this.primaryKeys.forEach(pk => {
                conditions.push("`" + pk + "` = ?");
                params.push(this.data[pk]);
            });

            const sql =
                "UPDATE `" +
                this.tableName +
                "` SET " +
                setValues.join(", ") +
                " WHERE " +
                conditions.join(" AND ") +
                " LIMIT 1";
            if (this.debug) {
                console.log([sql, params]);
            }
            return this.db.execute(sql, params);
        };

        if (this.isNewRecord) {
            return await insertNewRecord();
            this.isNewRecord = false;
        } else {
            if (this.updatedFields.length === 0) return;
            await updateRecord();
            this.updatedFields = [];
        }
    }
}

export const setDefaultConfig = function(config) {
    Object.assign(defaultConfig, config);
};

const proxiedCActiveRecord = createDefaultProxy(CActiveRecord, {
    publicPropList: ["debug"]
});
proxiedCActiveRecord.setDefaultConfig = setDefaultConfig;

export default proxiedCActiveRecord;
