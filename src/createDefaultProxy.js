import _ from "lodash";

const _isPublicMethod = (target, prop)=>{
    if(typeof target[prop] === "function") return true;
    else return false;
};

const _isPublicProp = (target, prop)=>{
    if(prop === "constructor" && typeof target[prop] === "function") return false;
    if(typeof target[prop] === "undefined") return false;
    else return true;
};

const _isPublicPropByList = (list, target, prop)=>{
    if(list.indexOf(prop)!==-1) return true;
    else return false;
};

const createDefaultProxy = function(cls,proxyDef={}){
    return function(...arg){
        this._obj = new (Function.prototype.bind.apply(cls, [this].concat(arg)));

        let isPublicMethod, isPublicProp, publicMethodList, publicPropList;

        publicMethodList = Array.isArray(proxyDef.publicMethodList) ? proxyDef.publicMethodList : null;
        publicPropList = Array.isArray(proxyDef.publicPropList) ? proxyDef.publicPropList : null;

        if(publicPropList && publicMethodList) {
            publicPropList = _.uniq(publicPropList.concat(publicMethodList));
        }

        if(typeof proxyDef.isPublicMethod === "function") isPublicMethod = proxyDef.isPublicMethod;
        else if(Array.isArray(publicMethodList)) isPublicMethod = _isPublicPropByList.bind(this,publicMethodList);
        else isPublicMethod = _isPublicMethod;

        if(typeof proxyDef.isPublicProp === "function") isPublicProp = proxyDef.isPublicProp;
        else if(Array.isArray(publicPropList)) isPublicProp = _isPublicPropByList.bind(this,publicPropList);
        else isPublicProp = _isPublicProp;

        let defaultProxyDef = {};

        if(typeof this._obj.set === "function"){
            defaultProxyDef.set = (target, property, value, receiver)=>{
                if(isPublicProp(target, property) && !isPublicMethod(target, property)) {
                    target[property] = value;
                    return true;
                }else {
                    let r=this._obj.set(property, value);
                    if(typeof r === "undefined") return true;
                    return r;
                }
            }
        }

        if(typeof this._obj.get === "function"){
            defaultProxyDef.get = (target, property, value, receiver)=>{
                if(isPublicProp(target, property)) {
                    if(isPublicMethod(target, property)) {
                        return target[property].bind(target);
                    }
                    else return target[property];
                }else {
                    return this._obj.get(property);
                }
            }
        }

        if(typeof this._obj.has === "function"){
            defaultProxyDef.has = (target, property)=>{
                return this._obj.has(property);
            }
        }

        if(typeof this._obj.ownKeys === "function"){
            defaultProxyDef.ownKeys = (target, property)=>{
                return this._obj.ownKeys();
            }
        }

        if(typeof this._obj.deleteProperty === "function"){
            defaultProxyDef.deleteProperty = (target, property)=>{
                return this._obj.deleteProperty(property);
            }
        }

        if(!Object.keys(defaultProxyDef).length) throw new Error("Cannot create empty proxy. No magic method can be found!");

        return new Proxy(this._obj, defaultProxyDef); 
    };
};

export default createDefaultProxy;
