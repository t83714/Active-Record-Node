# Active-Record-Node
A Simple Active Record Style ORM for Node.

Features:
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

## Getting started

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
        await record.commit();

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

