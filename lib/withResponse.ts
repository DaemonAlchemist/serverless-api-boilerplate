export const withResponse = (statusCode:number, msg:string) => {
    console.log(`${statusCode}: ${msg}`)
    return {statusCode, msg};
  }
  