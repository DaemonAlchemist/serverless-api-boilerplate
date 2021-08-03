import {db} from './serverless-client';

export const mutex = (tableName: string, timeout:number = 500, wait:number = 50) => ({
    acquire: lock(tableName, timeout, wait)
});

const lock = (TableName: string, timeout:number = 5000, wait:number = 100) =>
    (id:string, shouldWait:boolean = true) => new Promise<() => Promise<undefined>>((resolve, reject) => {

        const acquireLock = () => {
            console.log(`Attempting to acquire ${id} lock`);
            db.doc.put(
                {
                    TableName,
                    Item: {id, expires: Date.now() + timeout},
                    ConditionExpression: `id <> :id OR (id = :id AND expires < :expires)`,
                    ExpressionAttributeValues: {
                        ':id': id,
                        ':expires': Date.now(),
                    }
                },
                (err?:any) => {
                    if(err) {
                        //Couldn't obtain the lock.  Try again if requested
                        console.log(err);
                        if(shouldWait) {
                            console.log(`Blocked on lock ${id}.  Waiting to acquire...`);
                            setTimeout(acquireLock, wait);
                        } else {
                            reject(`Could not obtain lock ${id}`);
                        }
                    } else {
                        console.log(`Acquired lock ${id}`);
                        resolve(unlock(TableName, timeout, wait, id));
                    }
                }
            );
        }
        acquireLock();
    });

const unlock = (TableName:string, timeout:number, wait:number, id:string) =>
    ():Promise<undefined> => new Promise((resolve:any, reject:any) => {
        db.doc.delete({TableName, Key: {id}}, () => {
            console.log(`Unlocked ${id}`);
            resolve();
        });
    });