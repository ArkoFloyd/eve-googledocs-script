/*


see  https://www.fuzzwork.co.uk/2017/03/14/using-esi-googledocs/ for install details.


Needs work, as it reauths for each call. As it can't store the access token or expiry in the sheet.





*/

function getSetup() {
 var config={};
 var namedRanges = SpreadsheetApp.getActiveSpreadsheet().getNamedRanges();
 for (var i = 0; i < namedRanges.length; i++) {
   switch (namedRanges[i].getName()) {
     case 'clientid':
       config.clientid=namedRanges[i].getRange().getCell(1, 1).getValue() ;
       break;
     case 'secret':
       config.secret=namedRanges[i].getRange().getCell(1, 1).getValue() ;
       break;
     case 'refresh':
       config.refreshtoken=namedRanges[i].getRange().getCell(1, 1).getValue() ;
       break;
   }

 }
 var documentProperties = PropertiesService.getDocumentProperties();
 config.expires = documentProperties.getProperty('oauth_expires');
 config.access_token = documentProperties.getProperty('access_token')
 return config;
}

  return config; 
}

function getAccessToken(config) {
  if (Date.now()>config.expires) {
   
//---------------------------- Changed    
  var url = 'https://login.eveonline.com/v2/oauth/token';
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic '+Utilities.base64EncodeWebSafe(config.clientid+':'+config.secret),   
  };
  var parameters = {
    'method': 'POST',
    'headers': headers,
    'payload': JSON.stringify({grant_type:'refresh_token',refresh_token: config.refreshtoken}),
    };
//---------------------------- 
   
  var response = UrlFetchApp.fetch(url, parameters).getContentText();
  var json = JSON.parse(response);
  var access_token = json['access_token'];
  
  config.access_token=access_token;
  config.expires=Date.now()+1200000
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty('access_token',access_token)
  documentProperties.setProperty('oauth_expires',config.expires)
  
  
  }

  return config;
  
}





function getCitadel(citadelid) {

  var config=getSetup();
  
  config=getAccessToken(config);
  
  var url = 'https://esi.tech.ccp.is/latest/markets/structures/'+citadelid+'/';
  
  
  var parameters = {method : "get", headers : {'Authorization':'Bearer '+ config.access_token}};
  
  var jsonFeed = UrlFetchApp.fetch(url, parameters).getContentText();
  var json = JSON.parse(jsonFeed);
  var prices=[];
  prices.push(['duration','buy','issued','location','min volume','order id','price','range','typeid','volume remaining','total volume'])
  if(json) {
    for(i in json) {
      var price=[json[i].duration,
                 json[i].is_buy_order,
                 json[i].issued,
                 json[i].location_id,
                 json[i].min_volume,
                 json[i].order_id,
                 json[i].price,
                 json[i].range,
                 json[i].type_id,
                 json[i].volume_remain,
                 json[i].volume_total
                ];
      prices.push(price);
     }
   }
   return prices;              
} 
