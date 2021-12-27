"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
// Connection URL
const url = "mongodb://localhost:27017";
const client = new mongodb_1.MongoClient(url);
// Database Name
const dbName = "myProject";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Use connect method to connect to the server
        yield client.connect();
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        const collection = db.collection("documents");
        yield collection.insertOne({ test: "yes!!!" });
        // the following code examples can be pasted here...
        return "done.";
    });
}
main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());
