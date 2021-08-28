# aws_lambda_simple_sms_service
AWS Lambda로 만드는 초 간단 코로나 정보 문자 메시지 예약 전송 서비스를 만들어 봅시다.  
  

----  
  
**1편 - [AWS Lambda로 만드는 초간단 코로나 정보 문자메시지 전송 서비스(1)](https://pds0309.github.io/lambdasms1/)** 
  
**2편 - [AWS Lambda로 만드는 초간단 코로나 정보 문자메시지 전송 서비스(2)](https://pds0309.github.io/lambdasms2/)**  
  
**[Github Actions를 이용해 람다 서비스 배포 자동화를 해보자](https://pds0309.github.io/lambddeploy/)**  

----
    
    
**활용**  

* [공공데이터포털-코로나19 감염 현황 Open-Api](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15043376)
* AWS Lambda - Runtime: node.js 14.x
* Amazon Simple Notification Service (Amazon SNS) 
* Amazon EventBridge  
* Amazon DynamoDB

  
**서비스 내용**  
* 오전 10시 30분마다 Dynamo DB에 등록된 이용자의 전화번호로 일일 코로나 확진자,완치자,지료중인환자,사망자 등의 정보를 메시지로 전송합니다.  
  

**실행 과정 요약**  
1. (가정) 웹 서비스 등을 통해 사용자가 서비스 신청을 하면 Dynamo DB에 사용자의 전화번호가 저장됨.  
2. EventBridge 스케줄링으로 오전 10시 30분에 Amazon SNS를 이용해 문자메시지를 전송하는 CoronaSmsService 람다함수가 실행됨.  
  * CoronaSmsService 가 실행 될 때  
    * 코로나 데이터 open-api 로 부터 금일 코로나 현황 데이터를 조회하는 CoronaInfo 람다함수가 호출되어 메시지 내용으로 전달됨.  
    * 유저 정보가 저장된 DynamoDB를 스캔하는 CoronaDynamo 람다함수가 호출되어 메시지 전달 대상으로 전달됨.  
      
  
**대략적인 구조**  
 
  
![covid](https://user-images.githubusercontent.com/76927397/131205710-85165ea5-11e5-4d48-bbc6-af3299918876.PNG)
  
  
**Branch**  
  
* Info -> CoronaInfo (covid 일일 데이터수집)
* master -> CoronaSmsService (메시지전송)
* db -> CoronaDynamo (유저 테이블 조회)