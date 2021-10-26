const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const lambda = new AWS.Lambda();

exports.handler = function(event, context, callback) {
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
    let corona = {
    FunctionName: 'CoronaInfo',
    InvocationType: 'RequestResponse',
    LogType: 'Tail'
  };
   let user = {
     FunctionName: 'CoronaDynamo',
     InvocationType: 'RequestResponse',
     LogType: 'Tail'
   };
   let coToday = "";
   let coysday = "";
   lambda.invoke(corona, function(err, data ) {
       try{
       if (err) {
            context.fail(err);
        }
        else{
            //today info
            coToday = (JSON.parse(data.Payload))[0];
            coysday = (JSON.parse(data.Payload))[1];
            var allDecideCnt = coToday.decideCnt._text;
            var allExamCnt = coToday.examCnt._text;
            var allClearCnt = coToday.clearCnt._text;
            var allDeathCnt = coToday.deathCnt._text;
            var tdDecideCnt = Number(allDecideCnt)- Number(coysday.decideCnt._text) + "";
            var tdExamCnt = Number(allExamCnt) - Number(coysday.examCnt._text);
            var tdClearCnt = Number(allClearCnt) - Number(coysday.clearCnt._text);
            var tdDeathCnt = Number(allDeathCnt) - Number(coysday.deathCnt._text);
            
            var message = "확진자:"+allDecideCnt+"▲"+tdDecideCnt+
					" 검사자:"+allExamCnt+"▲"+tdExamCnt+
					" 격리해제:"+allClearCnt+"▲"+tdClearCnt+
					" 사망자:"+allDeathCnt+"▲"+tdDeathCnt;
			var paramsForSMS = [];
			var publishTextPromise;
			lambda.invoke(user , function(err,data){
            if(err){
                context.fail(err);
                }
            else{ 
                let users  = JSON.parse(data.Payload);
                // let publishTextPromise;
                for(let i = 0 ; i < users.length ; i++){
                    paramsForSMS.push({Message :message , PhoneNumber:"+82" + users[i].phone});
                                                           // sns 서비스는 대한민국 리전에서 사용 불가능
                    publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31',region: 'ap-northeast-1'}).publish(paramsForSMS[i]).promise();
                    publishTextPromise.then(
                        function(data){
                            callback(null,data.MessageId);
                        }
                        ).catch(function(err){callback(err);});
                }
                }
            });
        }
       }
       catch { 
            const params = {
                MessageBody: "전송실패",
                QueueUrl: "https://sqs.ap-northeast-2.amazonaws.com/157823348930/CoronaSmsNotUpdatedSqs"
            };
            try {
                const response = sqs.sendMessage(params).promise();
                response.then(function(data){ callback(JSON.stringify(data));});
                console.log(response);
                console.log(params);
            }
            catch (e) { 
                console.log(e);
                }
        }       
    });

};
