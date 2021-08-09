import { Func, Tuple } from "ts-functional/dist/types";

export declare type Maybe<T> = T | null;

export declare interface IPath {
    [key:string]:string;
}

export declare interface IQuery {
    [key:string]: string | string[];
}

export declare interface IEvent<T> {
    body:T;
    multiValueQueryStringParameters: Maybe<{
        [key:string]: string[];
    }>;
    pathParameters: Maybe<{
        [key:string]: string;
    }>;
    queryStringParameters: Maybe<{
        [key:string]: string;
    }>;
    headers: {
        [id:string]: string | string[];
    };
    httpMethod: "POST" | "GET" | "PUT" | "PATCH" | "OPTIONS" | "HEAD" | "DELETE";
    isBase64Encoded: boolean;
    multiValueHeaders: {
        [id:string]: string[];
    };
    path: string;
    requestContext: {
        accountId: string;
        apiId: string;
        authorizer: {
            claims?: string;
            scopes?: string;
            principalId: string;
        },
        domainName: string;
        domainPrefix: string;
        extendedRequestId: string;
        httpMethod: "POST" | "GET" | "PUT" | "PATCH" | "OPTIONS" | "HEAD" | "DELETE";
        identity: {
            accessKey: string | null;
            accountId: string;
            apiKey: string;
            caller: string;
            cognitoAuthenticationProvider: string;
            cognitoAuthenticationType: string;
            cognitoIdentityId: string;
            cognitoIdentityPoolId: string;
            principalOrgId: string | null;
            sourceIp: string;
            user: string;
            userAgent: string;
            userArn: string;
        };
        path: string;
        protocol: string;
        requestId: string;
        requestTime: string;
        requestTimeEpoch: number;
        resourceId: string;
        resourcePath: string;
        stage: string;
    };
    resource: string;
    stageVariables?: any;
}

interface IStatus {
    statusCode: number;
}

interface IMsg {
    msg: string;
}

interface IMessage {
    message: string;
}

interface IErrorDetails {
    details?: any;
    env?: NodeJS.ProcessEnv;
}

interface IErrorBody extends IErrorDetails {
    message: string;
}

export declare type Error = IStatus & (IMsg | IMessage) & IErrorDetails;

export declare interface IApiGatewayResponse<T> {
    statusCode: number;
    headers?: {
        [header:string]:string | boolean;
    }
    body: T | IErrorBody;
}

export declare type   GetFunction<T, R = T> = (path:Maybe<IPath>, query:Maybe<IQuery>, env:NodeJS.ProcessEnv, event:IEvent<null>      ) => Promise<R>;
export declare type  PostFunction<T, R = T> = (path:Maybe<IPath>, body:Partial<T>,     env:NodeJS.ProcessEnv, event:IEvent<T>         ) => Promise<R>;
export declare type   PutFunction<T, R = T> = (path:Maybe<IPath>, body:Partial<T>,     env:NodeJS.ProcessEnv, event:IEvent<T>         ) => Promise<R>;
export declare type PatchFunction<T, R = T> = (path:Maybe<IPath>, body:Partial<T>,     env:NodeJS.ProcessEnv, event:IEvent<Partial<T>>) => Promise<R>;
export declare type DeleteFunction          = (path:Maybe<IPath>, body:undefined,      env:NodeJS.ProcessEnv, event:IEvent<null>      ) => Promise<null>;

export declare type Handler<T> = Func<IEvent<T>, Promise<IApiGatewayResponse<string>>>;

export declare type Validator<T> = Func<IEvent<T>, Promise<Tuple<boolean, string | undefined>>>;

export declare interface IAMStatement {
    Effect: string;
    Action: string | string[];
    Resource: string | string[];
}

export declare type Mapping = [string, string, string, (IAMStatement[])?];
export declare type UrlMapper = (baseUrl:string, srcBase:string) => Mapping[];
