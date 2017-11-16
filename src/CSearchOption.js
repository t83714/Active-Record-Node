/**
 * @author Jacky Jiang
 * @class CSearchOption
 * @description Nov 2017; Class presents the search option.
 */
import util from "util";
import * as proxyHandlerSymbols from "./proxyHandlerSymbols";
import createDefaultProxy from "./createDefaultProxy";

const supportOperators = ["=","!=",">",">=","<","<=","LIKE","NOT LIKE","IN","NOT IN","IS NOT NULL","IS NULL"];

class CSearchOption{
    constructor(fieldName){
        this.fieldName = fieldName;
        this.operators = {};
        this.seperator = "AND";
    }

    get(property){
        return this[proxyHandlerSymbols.get](property);
    }

    set(property, value){
        this[proxyHandlerSymbols.set](property, value);
    }

    [util.inspect.custom](depth, opts){
        return this.operators;
    }

    [proxyHandlerSymbols.set](property, value){
        if(supportOperators.indexOf(property)===-1) throw new Error(`Unsupport operator ${property}`);
        this.operators[property]=value;
    }

    [proxyHandlerSymbols.get](property){
        return this.operators[property];
    }

    [proxyHandlerSymbols.has](property){
        return typeof this.operators[property]==="undefined" ? false: true;
    }

    [proxyHandlerSymbols.ownKeys](){
        return Object.keys(this.operators);
    }

    [proxyHandlerSymbols.getOwnPropertyDescriptor](target, prop){
        return Object.getOwnPropertyDescriptor(target.operators, prop);
    }

    [proxyHandlerSymbols.deleteProperty](property) {
        delete this.operators[property];
    }

    getSQLConditions(){
        const conditions = [];
        let params = [];

        const createStdConditionParams = (opt) => {
            params.push(this.operators[opt]);
            conditions.push(`\`${this.fieldName}\` ${opt} ?`);
        };

        const createInConditionParams = (opt) => {
            let value = this.operators[opt];
            if(typeof value !== "string" && !Array.isArray(value)) throw new Error("Parameter value for IN operation should be either string or Array");
            if(typeof value === "string"){
                value = value.split(",");
            }
            if(value.length) throw new Error("Parameter value for IN operation should include at leaset one item");
            let item_lists = value.map(()=>"?").join(",");
            params = params.concat(value);
            conditions.push(`\`${this.fieldName}\` ${opt} (${item_lists})`);
        };

        const createNoValueConditionParams = (opt) => {
            conditions.push(`\`${this.fieldName}\` ${opt}`);
        };

        Object.keys(this.operators).forEach(opt=>{
            switch(opt)
            {
                case "=" : 
                    if(this.operators[opt]===null) conditions.push(`\`${this.fieldName}\` IS NULL`);
                    else{
                        createStdConditionParams(opt);
                    }
                    break;
                case "!=" : 
                    if(this.operators[opt]===null) conditions.push(`\`${this.fieldName}\` IS NOT NULL`);
                    else{
                        createStdConditionParams(opt);
                    }
                    break;
                case ">" :
                case ">=" :
                case "<" :
                case "<=" :
                case "NOT LIKE" :
                case "LIKE" :
                    createStdConditionParams(opt);
                    break;
                case "NOT IN" :
                case "IN" :
                    createInConditionParams(opt);
                    break;
                case "IS NULL" :
                case "IS NOT NULL" :
                    createNoValueConditionParams(opt);
                    break;
                default: throw new Error(`Unknown operator: ${opt}`);
            }
        });

        return [
            conditions.join(this.seperator),
            params
        ];
    }
}

const proxiedCSearchOption = createDefaultProxy(CSearchOption);

export default proxiedCSearchOption;
