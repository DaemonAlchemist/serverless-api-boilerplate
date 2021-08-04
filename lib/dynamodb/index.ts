import { mutex } from "./mutex";
import { db } from "./serverless-client";
import { boilerplate, docExists, loadDoc, putDoc, putDocAtomic, initTables } from "./util";

export const dynamodb = {
    mutex, loadDoc, docExists, putDocAtomic, putDoc, db, boilerplate, initTables
}