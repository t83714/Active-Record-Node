import _ from "lodash";
import * as proxyHandlerSymbols from "./proxyHandlerSymbols";

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

const createDefaultProxy = function(cls, proxyDef = {}, exposePublicProperties = true){
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

        if(typeof this._obj[proxyHandlerSymbols.set] === "function"){
            defaultProxyDef.set = (target, property, value, receiver)=>{
                if(isPublicMethod(target, property)){
                    return false;
                }else if(exposePublicProperties && isPublicProp(target, property)){
                    target[property] = value;
                    return true;
                }else{
                    const r=this._obj[proxyHandlerSymbols.set](property, value);
                    if(typeof r === "undefined") return true;
                    return r;
                }
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.get] === "function"){
            defaultProxyDef.get = (target, property, value, receiver)=>{
                if(isPublicMethod(target, property)){
                    return target[property].bind(target);
                }else if(exposePublicProperties && isPublicProp(target, property)){
                    return target[property];
                }else{
                    return this._obj[proxyHandlerSymbols.get](property);
                }
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.has] === "function"){
            defaultProxyDef.has = (target, property)=>{
                return this._obj[proxyHandlerSymbols.has](property);
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.ownKeys] === "function"){
            defaultProxyDef.ownKeys = (target, property)=>{
                return this._obj[proxyHandlerSymbols.ownKeys](target);
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.getOwnPropertyDescriptor] === "function"){
            defaultProxyDef.getOwnPropertyDescriptor = (target, prop)=>{
                return this._obj[proxyHandlerSymbols.getOwnPropertyDescriptor](target, prop);
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.deleteProperty] === "function"){
            defaultProxyDef.deleteProperty = (target, property)=>{
                return this._obj[proxyHandlerSymbols.deleteProperty](property);
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.apply] === "function"){
            defaultProxyDef.apply = (target, thisArg, argumentsList)=>{
                return this._obj[proxyHandlerSymbols.apply](target, thisArg, argumentsList);
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.construct] === "function"){
            defaultProxyDef.apply = (target, argumentsList, newTarget)=>{
                return this._obj[proxyHandlerSymbols.construct](target, argumentsList, newTarget);
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.defineProperty] === "function"){
            defaultProxyDef.apply = (target, property, descriptor)=>{
                return this._obj[proxyHandlerSymbols.defineProperty](target, property, descriptor);
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.getPrototypeOf] === "function"){
            defaultProxyDef.apply = (target)=>{
                return this._obj[proxyHandlerSymbols.getPrototypeOf](target);
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.isExtensible] === "function"){
            defaultProxyDef.apply = (target)=>{
                return this._obj[proxyHandlerSymbols.isExtensible](target);
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.preventExtensions] === "function"){
            defaultProxyDef.apply = (target)=>{
                return this._obj[proxyHandlerSymbols.preventExtensions](target);
            }
        }

        if(typeof this._obj[proxyHandlerSymbols.setPrototypeOf] === "function"){
            defaultProxyDef.apply = (target, prototype)=>{
                return this._obj[proxyHandlerSymbols.setPrototypeOf](target, prototype);
            }
        }

        if(!Object.keys(defaultProxyDef).length) throw new Error("Cannot create empty proxy. No proxy handler symbols can be found!");

        return new Proxy(this._obj, defaultProxyDef); 
    };
};

export default createDefaultProxy;
