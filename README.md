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



### 추가사항 - 2021-10-26 

**문제상황** 

공공데이터에서 어떤날은 9시 30분에 업데이트가 되고 어떤날은 10시 30분이 넘어도(특히주말) 업데이트 되지 않는다.
10시 30분 이내에 공공데이터가 업데이트 되지 않았던 날은 메시지 전송자체를 실패하여 사용자가 메시지를 받아볼 수 없게 된다.

**해결** 
 
메시지 전송에 실패한 시점에서 메시지 전송을 시도하지 말고 SQS에 해당 상황을 보낸다. 
해당 SQS에 저장된 대기열에 대한 정보를 소비할 수 있는 람다함수를 만든다.
SQS에서 람다함수가 10분 간격으로 호출할 수 있게끔 설정한다.
10분마다 람다함수는 코로나 정보 메시지 전송을 다시 시도하게 된다.

코로나 데이터가 정상적으로 수집되고 메시지 전송이 성공할 상황이라면 메시지를 전송하고 더 이상 SQS와 통신하지 않는다.

오전 11시까지 메시지 전송에 실패하게 될 경우 그 날은 더이상 메시지를 보내지 않는다.

![sqs](https://user-images.githubusercontent.com/76927397/138846373-334c00ae-a9f0-459a-b3bc-b4e57f2f09eb.PNG)

**추가변경사항** 
 
메시지 전송 스케줄 10시30분 -> 9시 40분으로 변경

<br> 

**앞으로 개선할 것** 
 
어떤 날은 모두 0,0,0,0 으로 문자가 오길래 확인해보았더니 api측 데이터에서 업로드 날짜를 잘못 적어넣었었다. 즉 api 자체에서 장애가 발생할 수 있다.

-> 어떤 원인으로 메시지 전송을 못했는지 SQS에 메시지로 전달하여 메시지 소비 함수에서 상황에 맞는 대처를 할 수 있게 처리가 필요하다.

예시1 ) 금일 코로나 데이터 수집에 실패하여 전송할 수 없다는 메시지 통보하기

예시2 ) 대책찾기 -> 다른 코로나 api 찾기 or 질병관리청 웹에서 긁어서 보내주기(질병관리청에 나온 정보는 비교적 정확할 것이다)



