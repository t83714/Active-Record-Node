/**
 * @author Jacky Jiang
 * @class CSearcher
 * @description CSearcher class for ORM; Nov 2017; Used for query database & return instance of CActiveRecord
 */
import util from "util";
import * as FieldFlags from "./field_flags";
import * as proxyHandlerSymbols from "./proxyHandlerSymbols";
import createDefaultProxy from "./createDefaultProxy";
import CSearchOption from "./CSearchOption";
import CActiveRecord from "./CActiveRecord";


const defaultConfig = {
    primaryKeys : ["id"],
    db : null,
    debug : false,
};

const compileQueryConditions = function(cData){
    const conditions = [];
    let params = [];
    Object.keys(cData).forEach((key)=>{
        const [c,p] = cData[key].getSQLConditions();
        conditions.push(c);
        params = params.concat(p);
    });
    return [conditions,params];
};

const parseNumber = (v) =>{
    if(typeof v === "number") return v;
    if(typeof v !== "string") return null;
    let n;
    try{
         n = parseInt(v,10);
        if(isNaN(n)) n = null;
    }catch(e){
        n = null;
    }
    return n;
};

const compileSelectSQL = function(arg1=null, arg2=null){
    const [conditions, params] = compileQueryConditions(this.data);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const groupBy = this.groupBy ? `GROUP BY ${this.groupBy}` : "";
    const orderBy = this.orderBy ? `ORDER BY ${this.orderBy}` : "";
    const arg1N = parseNumber(arg1);
    const arg2N = parseNumber(arg2);
    let limit;
    if(arg1N !== null && arg2N !== null){
        limit = `LIMIT ?,?`;
        params.push(arg1N,arg2N);
    }else if(arg1N !== null){
        limit = `LIMIT ?`;
        params.push(arg1N);
    }else{
        limit = "";
    }
    const sql = `SELECT * FROM \`${this.tableName}\` ${where} ${groupBy} ${limit}`;
    if(this.debug) {
        console.log([sql,params]);
    }
    return [sql,params];
};

class CSearcher {

    constructor(tableName, options = null){
        
        const config={};
        
        if(options) Object.assign(config,defaultConfig,options);
        else Object.assign(config,defaultConfig);

        this.db = config.db;

        if(!this.db) throw new Error("Cannot locate db obj from config options");

        if(!tableName || typeof tableName !== "string") throw new Error("invalid parameter: tableName");
        this.data = {};
        this.primaryKeys = config.primaryKeys;
        this.tableName = tableName.trim();
        this.orderBy = null;
        this.groupBy = null;
        this.debug = config.debug;
    }

    get(property){
        return this[proxyHandlerSymbols.get](property);
    }

    set(property, value){
        this[proxyHandlerSymbols.set](property, value);
    }

    [util.inspect.custom](depth, opts){
        return this.data;
    }

    [proxyHandlerSymbols.set](property, value){
        if(typeof this.data[property]==="undefined") this.data[property]=new CSearchOption(property);
        this.data[property]["="]=value;
    }

    [proxyHandlerSymbols.get](property){
        if(typeof this.data[property]==="undefined") {
            this.data[property]=new CSearchOption(property);
            return this.data[property];
        }
        return this.data[property]["="];
    }

    [proxyHandlerSymbols.has](property){
        return typeof this.data[property]==="undefined"? false : true;
    }

    [proxyHandlerSymbols.ownKeys](){
        return Object.keys(this.data);
    }

    [proxyHandlerSymbols.getOwnPropertyDescriptor](target, prop){
        return Object.getOwnPropertyDescriptor(target.data, prop);
    }

    [proxyHandlerSymbols.deleteProperty](property){
        delete this.data[property];
    }

    fetchResult(arg1=null,arg2=null){
        const [sql, params] = compileSelectSQL.apply(this);
        return this.db.execute(sql,params).then(([rows, fields])=>{
            const primaryKeys = [];
            const result = [];
            fields.forEach(field => {
                if( field.flags & FieldFlags.PRI_KEY ) primaryKeys.push(field.name);
            });
            return rows.map(row=>(new CActiveRecord(this.tableName,{
                initData: row,
                primaryKeys
            })));
        });
    }

    fetchRawData(arg1=null,arg2=null){
        const [sql, params] = compileSelectSQL.apply(this);
        return this.db.execute(sql,params).then(([rows, fields])=>{
            return rows;
        });
    }
}

export const setDefaultConfig = function(config){
    Object.assign(defaultConfig, config);
};

const proxiedCSearcher = createDefaultProxy(CSearcher);
proxiedCSearcher.setDefaultConfig = setDefaultConfig;

export default proxiedCSearcher;
