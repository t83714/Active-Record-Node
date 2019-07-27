# Active-Record-Node 

A Simple Active Record Style ORM for Node.

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@hostaworld/active-record-node.svg)](https://bundlephobia.com/result?p=@hostaworld/active-record-node) [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

## Features:
* Implment [[util.inspect.custom]](https://nodejs.org/api/util.html#util_custom_inspection_functions_on_objects) method. Therefore, console.log() will show actual data as plain object.

i.e. Implmention details will be covered and only user data is visible from console.log.
```
const s = new CSearcher("people"); //--- query people table
s["firstName"]="Tom"; //-- fetch all records firstName column = "Tom"
s["lastName"]="Green"; //-- And lastName column = "Green"
const rows = await s.fetchResult(); //--- fetch all records match the conditions
console.log(s);
console.log(rows);
```
The followings will ne shown in console:
```
{ firstName: { '=': 'Tom' }, lastName: { '=': 'Green' } }
[ { id: 3, firstName: 'Tom', lastName: 'Green' } ]
```

* Used [Proxy object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to redefine custom behavior for fundamental operations (e.g. property lookup, assignment, enumeration, function invocation, etc) on CActiveRecord Class. Thus, the followings are possible:

```
const car = new CActiveRecord("cars"); //--- create a new record on `car` table
car["make"]="ford"; //--- set make column to "ford"
car["model"]="falcon";

for(let f in rows[0]){
    console.log(f); //--- output: make, model
}
```
If a table has columns with the following special names:
* set
* get
* delete
* commit

You can set the column value using `set` or `get` method:
```
car.set("set","abc"); //--- set `set` column of `car` table to "abc"
car.get("get"); //-- get `get` column of `car` table
```

## Getting Started

Create test table `people` in `test` database:

```
CREATE TABLE `test`.`people` ( 
    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT ,  
    `firstName` VARCHAR(255) NOT NULL DEFAULT '' ,  
    `lastName` VARCHAR(255) NOT NULL DEFAULT '' ,    
    PRIMARY KEY  (`id`)
) ENGINE = MyISAM;
```

Create index.js:
```
const mysql = require("mysql2/promise"); //--- load Mysql2 lib;
const {CSearcher, CActiveRecord,setDB} = require("@hostaworld/active-record-node");

CSearcher.setDefaultConfig({
    debug:true // --- debug mode will print SQL in console
});

CActiveRecord.setDefaultConfig({
    debug:true // --- debug mode will print SQL in console
});

//-- Create mysql connection
const db = mysql.createPool({
    connectionLimit: 1,
    host: "192.168.1.166",
    user: "root",
    password: "",
    database: "test"
});

setDB(db); //-- @hostaworld/active-record-node will use this db connection

(async ()=>{
    try{
        let s, rows;

        //-- create new record for table people
        const record = new CActiveRecord("people");
        record["firstName"] = "Jim";
        record["lastName"] = "Will";
        const newId = await record.commit();

        console.log(newId); //--- output newly generated auto increment primary key

        s = new CSearcher("people"); //--- query people table
        s["id"]["<="] = 100; //-- fetch all records id <= 100
        rows = await s.fetchResult(1); //--- fetch first record id = 1

        console.log(rows);

        rows[0]["firstName"] = "Tom"; //--- update firstName column of the row
        rows[0]["lastName"] = "Green"; //--- update lastName column of the row
        await rows[0].commit();

        s = new CSearcher("people"); //--- query people table
        s["firstName"]="Tom"; //-- fetch all records firstName column = "Tom"
        s["lastName"]="Green"; //-- And lastName column = "Green"
        rows = await s.fetchResult(); //--- fetch all records match the conditions

        console.log(rows);

        await rows[0].delete(); //--- delete this record
        
    }catch(e){
        console.log(e);
    }
    process.exit();
})();
```


## Installation

`@hostaworld/active-record-node` requires node v7.6.0 or higher for ES2015 and async function support.

```
npm install --save @hostaworld/active-record-node
```

You also need [mysql2](https://www.npmjs.com/package/mysql2):

```
npm install --save mysql2
```

## Babel setup

If you're not using node v7.6+, we recommend setting up babel with babel-preset-env:

```
npm install babel-register babel-preset-env --save
```
Setup babel-register in your entry file:
```
require('babel-register');
```
And have your .babelrc setup:
```
{
  "presets": [
    ["env", {
      "targets": {
        "node": true
      }
    }]
  ]
}
```

## API 

### Class CActiveRecord

This class creates the data access mapping to a table row in database.

Import class

```
import { CActiveRecord } from "@hostaworld/active-record-node";
```
or 
```
const { CActiveRecord } = require("@hostaworld/active-record-node");
```

#### Methods:

* construct(tableName) : You don't have to initiate the object of CActiveRecord unless you need to create new record of the target table.
    * tableName: String. table name of the target table.
* set(columnName, value) :  Set/update the value of one column of the target table. You only need this method if the column name is one of those special names, such as `set`, `get` etc. See in top [Features](#features) section.
* get(columnName) : Get the value of one column of the target table.
* commit() : Save any possible changes to database.
    * Will return the promise of the requested operation. Use `await` expression to pause the operation until the Promise is fulfilled or rejected.
    * If commit involves `insert` operation, the promise will be resolved to the newly generated ID for an auto increment primary key. Otherwise, the promise will be resolved to `undefined`.
* delete() : Delete the relevant record from database.
    * Will return the promise of the requested operation. Use `await` expression to pause the operation until the Promise is fulfilled or rejected.

#### Control Properties

The following control properties can be used to control how CSearcher fetch result from database:

* `debug` : set this property to true will cause CSearcher output all SQL queries to terminal (through `console.log`)

### Class CSearcher

This class creates a query interface mapping to a table row in database.

Set value of a property of initiated CSearcher object will create `equals` query condition.

e.g.
```
const s = new CSearcher("table");
s["columnName"]=value;
```
Will generate query condition `columnName=value`.

You also can create the similar query condition by:
```
const s = new CSearcher("table");
s["columnName"]["="]=value;
``` 
the `["="]` can be replaced with other operators (e.g. `["operator"]`). Supported operators are:
* `=` : equals
* `!=` : not equals
* `>` : larger than
* `>=` : larger than or equal to 
* `<` : lower than
* `<=` : lower than or equal to 
* `LIKE` : string column matching certain parttern
* `NOT LIKE` : string column matching certain parttern
* `IN` : Column value is included in the list. value provided must be an array
* `NOT IN` : Column value is not included in the list. value provided must be an array
* `IS NOT NULL` : You can set any value when set this operator. The value you set will be ignored. e.g. `s["column"]["IS NOT NULL"]=1;` will generate query condition `column IS NOT NULL`.
* `IS NULL` : You can set any value when set this operator. The value you set will be ignored. e.g. `s["column"]["IS NULL"]=1;` will generate query condition `column IS NULL`.

For usage, please see [Getting Started](#getting-started) section above.

Import class

```
import { CSearcher } from "@hostaworld/active-record-node";
```
or 
```
const { CSearcher } = require("@hostaworld/active-record-node");
```

#### Methods:

* construct(tableName) : Initiate an instance of the CSearcher class
    * tableName: String. table name of the target table.
* fetchResult(arg1=null,arg2=null) : get records that meet query conditions from database table.
    * will return an array of the matching table rows. Each array item is the instance of CActiveRecord class. If no match record found, empty array will return.
    * Both arg1 & arg2 expect an integer. 
    * If both parameters present, arg1 stands for offset of the result set and arg2 stands for the number of records to be fetched.
    * If only arg1 is provided, arg1 stands for the number of records to be fetched.
* fetchRawData(arg1=null,arg2=null) : Same as fetchResult. Only difference is this method will result set as plain objects. 

#### Control Properties

The following control properties can be used to control how CSearcher fetch result from database:

* `orderBy` : set order of returned records.
    * e.g. `s.orderBy = 'columnA ASC';`
* `groupBy` : group result by certian column
    * e.g. `s.groupBy = 'columnA,columnB';`
* `debug` : set this property to true will cause CSearcher output all SQL queries to terminal (through `console.log`)

### Function setDB(db)

Ultility function to set db connection to be used by [CActiveRecord](#class-cactiverecord) & [CSearcher](#class-csearcher)

Parameter `db` can be `connection` or `pool` of [mysql2](https://github.com/sidorares/node-mysql2) or [mysql](https://github.com/mysqljs/mysql) libs (or any objects support query & execute method)

Examples: 

```
const mysql = require("mysql2/promise"); //--- load Mysql2 lib;
const {setDB} = require("@hostaworld/active-record-node");
//-- Create mysql connection
const db = await mysql.createConnection({
    host: "192.168.1.166",
    user: "root",
    password: "",
    database: "test"
});

setDB(db); //-- @hostaworld/active-record-node will use this db connection
```

or 

```
const mysql = require("mysql2/promise"); //--- load Mysql2 lib;
const {setDB} = require("@hostaworld/active-record-node");
//-- Create mysql connection
const db = mysql.createPool({
    connectionLimit: 1,
    host: "192.168.1.166",
    user: "root",
    password: "",
    database: "test"
});

setDB(db); //-- @hostaworld/active-record-node will use this db connection
```

[npm-image]: https://badge.fury.io/js/%40hostaworld%2Factive-record-node.svg
[npm-url]: https://badge.fury.io/js/%40hostaworld%2Factive-record-node
[travis-image]: https://travis-ci.org/t83714/Active-Record-Node.svg
[travis-url]: https://travis-ci.org/t83714/Active-Record-Node
[daviddm-image]: https://david-dm.org/t83714/Active-Record-Node.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/t83714/Active-Record-Node
[coveralls-image]: https://coveralls.io/repos/github/t83714/Active-Record-Node/badge.svg
[coveralls-url]: https://coveralls.io/repos/github/t83714/Active-Record-Node
