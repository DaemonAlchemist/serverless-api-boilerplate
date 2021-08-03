// Exported from simple-json-formatter to fix type errors
export function format(data: string, indentChar?: string, indentBase?: string){
	indentChar = indentChar ? indentChar : "\t";
	indentBase = indentBase ? indentBase : "";

	let formattedJSON = "";
	let dataObject:Object = {};
	try{
		dataObject = JSON.parse(data) as Object;
	} catch(Error){
		throw new TypeError("data parameter is not a valid JSON string !");
		return;
	}
	let dataIsArray = JSONtypeOf(dataObject) == "array";

	// OPEN
	if(dataIsArray){
		if(data.length == 0) // Test empty array case
			return "[]";
		formattedJSON = "[";
	}else{
		let objectsCount = 0;
		for(let obj in dataObject){
			objectsCount++;
			break;
		}
		if(objectsCount == 0) // Test empty object case
			return "{}";
		formattedJSON = "{";
	}
	// CONTENT
	let objectsCount = 0;
	let keys = Object.keys(dataObject);
	for(let keyID = 0; keyID < keys.length; ++keyID){
		if(objectsCount > 0)
			formattedJSON += ",";
		if(dataIsArray)
			formattedJSON += `\n${indentBase}${indentChar}`
		else
			formattedJSON += `\n${indentBase}${indentChar}"${keys[keyID]}": `;

		const key:string = keys[keyID];
		const obj = (dataObject as any)[key];
		switch(JSONtypeOf(obj)){
			case "array":
			case "object":
				formattedJSON += format(JSON.stringify(obj), indentChar, indentBase + indentChar);
				break;
			case "number":
				formattedJSON += obj.toString();
				break;
			case "null":
				formattedJSON += "null";
				break;
			case "string":
				formattedJSON += `"${obj}"`;
				break;
			case "boolean":
				formattedJSON += obj;
				break;
		}
		objectsCount++;
	}

	// CLOSE
	if(dataIsArray)
		formattedJSON += `\n${indentBase}]`;
	else
		formattedJSON += `\n${indentBase}}`;

	return formattedJSON;
}

function JSONtypeOf(obj:any) {
	let typeOf = typeof(obj);
	if (typeOf == "object") {
		if (obj === null) return "null";
		if (Array.isArray(obj)) return "array";
		return "object";
	}
	return typeOf;
}
