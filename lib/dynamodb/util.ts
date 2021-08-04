import { AWSError, DynamoDB } from "aws-sdk";
import { flatten, prop } from "ts-functional";
import { Func } from "ts-functional/dist/types";
import { IEvent, IPath } from "../api";
import { CodedPromise } from "../coded-promise";
import { db } from "./serverless-client";

// Note: indexes assume indexed columns are strings
export const tableDef = (TableName:string, indexes:string[] = []) => ({
    TableName,
    KeySchema: [
        {AttributeName: "id", KeyType: "HASH"},
    ],
    AttributeDefinitions: [
        {AttributeName: "id", AttributeType: "S"},
        ...indexes.map(att => ({
            AttributeName: att,
            AttributeType: "S",
        })),
    ],
    GlobalSecondaryIndexes: indexes.length > 0 ? indexes.map(att => ({
        IndexName: `${att}Index`,
        KeySchema: [{
            AttributeName: att,
            KeyType: "HASH",
        }],
        Projection: {
            ProjectionType: "ALL",
        }
    })) : undefined,
    BillingMode: "PAY_PER_REQUEST",
});

export const loadDocByIndex = <T>(TableName:string, label:string) =>
    (column:string) =>
        (value:string):Promise<T[]> =>
            CodedPromise<T[]>((resolve:Func<T[], void>, {}, {}, {}, notFound:Func<string, void>) => {
                db.doc.query(
                    {
                        TableName,
                        IndexName: `${column}Index`,
                        KeyConditionExpression: `${column} = :value`,
                        ExpressionAttributeValues: {
                            ":value": value,
                        }
                    },
                    (err, data) => {
                        if(err || typeof data.Items === "undefined" || data.Items.length === 0) {
                            console.log(`${label} with ${column}=${value} does not exist`);
                            notFound(`${label} with ${column}=${value} does not exist`);
                        } else {
                            console.log(`Got details for ${label} with ${column}=${value}`);
                            console.log(data.Items);
                            resolve(data.Items as T[]);
                        }
                    }
                );
            });

export const loadDoc = <T>(TableName:string, label:string) =>
    (id:string):Promise<T> =>
        CodedPromise<T>((resolve:Func<T, void>, {}, {}, {}, notFound:Func<string, void>) => {
            db.doc.get({TableName, Key: {id}}, (err, data) => {
                if(err || typeof data.Item === "undefined") {
                    console.log(`${label} ${id} does not exist`);
                    notFound(`${label} ${id} does not exist`);
                } else {
                    console.log(`Got details for ${label} ${id}`);
                    console.log(data.Item);
                    resolve(data.Item as T);
                }
            });
        });

export const docExists = <T>(TableName:string, label:string) => (id:string):Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    loadDoc(TableName, label)(id)
        .then(() => resolve(true))
        .catch(() => resolve(false));
});
  
export const putDoc = <T extends {id:string}>(TableName:string, label:string) => (Item:T) => CodedPromise<T>(
    (resolve:Func<T, void>, {}, {}, error:Func<string, void>, {}) => {
        db.doc.put({TableName, Item}, (err:AWSError, data: DynamoDB.DocumentClient.PutItemOutput) => {
            if(err) {
                error(`There was an error creating your ${label}: ${err}`);
                console.log(err);
                console.log(Item);
            } else {
                loadDoc<T>(TableName, label)(Item.id).then(resolve);
            }
        })
    }
);

export const putDocAtomic = (...insertions:{table: string, label: string, items: any[]}[]) =>
    CodedPromise<void>((resolve:Func<void, void>, {}, {}, error:Func<string, void>, {}) => {
        db.doc.transactWrite({
            TransactItems: flatten(insertions.map(op => op.items.map(Item => ({Put: {TableName: op.table, Item}})))),
        }, (err) => {
            if(err) {
                error(`There was an error inserting the ${insertions.map(prop("table")).join(", ")} items: ${err}`);
            } else {
                resolve();
            }
        })
    });

export const boilerplate = <T extends {id: string}>(TableName:string, label:string) => ({
    exists: docExists<T>(TableName, label),
    load: loadDoc<T>(TableName, label),
    loadByIndex: loadDocByIndex<T>(TableName, label),
    put: putDoc<T>(TableName, label),
    atomic: (items:T[]) => ({table: TableName, label, items}),
});

export interface ITableDef {
    def:DynamoDB.CreateTableInput,
    name: string;
}

const createTable = (info:ITableDef) => new Promise<void>((resolve, reject) => {
    db.raw.createTable(info.def, (err:any) => {
      if(err) {
        console.log(err); reject();
      } else {
        console.log(`${info.name} table created`);
        resolve();
      }
    });
  });

export const initTables = (tables:ITableDef[]) => (body:any, path:IPath, env:NodeJS.ProcessEnv, event:IEvent<any>) => new Promise<string>((resolve, reject) => {
    Promise.all(tables.map(createTable)).then(() => {
        resolve("Tables created");
    });
});
  