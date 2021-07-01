const https = require('http');
const convert = require('xml-js');
const mom = require('moment');
exports.handler = async (event) => {
    let today = mom().format("YYYYMMDD");
    let ysday = mom().subtract(1, 'd').format("YYYYMMDD");

    let dataString = '';
    let xmlToJson;
    let js;

    let reqq = "http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19InfStateJson?serviceKey=0%2BOtzppXZgysqfWZNXNX8WVa8zRSlUtg5ARMUmPSc0En9D3LVNdYbYOIiXNv%2BeVEbAI3mz39p5ZKmo%2BzKtxk2w%3D%3D";
    reqq = reqq + "&startCreateDt="+ysday +"&endCreateDt="+today;
    const response = await new Promise((resolve, reject) => {
         const req = https.get(reqq, function(res) {
          res.on('data', chunk => {
            dataString += chunk;
            xmlToJson = convert.xml2json(dataString, {compact: true, spaces: 4});
            js = JSON.parse(xmlToJson);
          });

          res.on('end', () => {
            resolve({
                statusCode: 200,
                body: js.response.body.items.item,
                yesterday: js.response.body.items.item[1]
            });
          });
         });
        
         req.on('error', (e) => {
          reject({
              statusCode: 500,
              body: '"error"'
          });
         });
    });
  return response.body;
};
