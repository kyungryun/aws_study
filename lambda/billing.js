var AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

exports.handler = function(event, context, callback){

    var today = new Date();

    var todayISOString = today.toISOString();

    var yesterdayISOString = new Date(today.getFullYear(), today.getMonth(), today.getDate()-1).toISOString();

    console.log("firstDayOfMonth:" + todayISOString);
    console.log("firstDayOfNextMonth:" + yesterdayISOString);

    console.log("==============slice string=============");

    todayISOString = todayISOString.slice(0, 10);
    yesterdayISOString = yesterdayISOString.slice(0, 10);

    console.log("firstDayOfMonth:" + todayISOString);
    console.log("firstDayOfNextMonth:" + yesterdayISOString);

    var costParams = {
        TimePeriod:{
            Start: yesterdayISOString,
            End: todayISOString,
        },
        Granularity: 'DAILY', Metrics: ['UnblendedCost'],
    };

    new AWS.CostExplorer().getCostAndUsage(costParams, function(err, costResult){
        if(err) return callback(err);

        console.log(JSON.stringify(costResult))

        var yesterdayBilling = costResult.ResultsByTime[0].Total.UnblendedCost.Amount;
        console.log("billing amount" + yesterdayBilling);

        var params = {
            Destination:{
                ToAddresses: [event.sender],
            },
            Message:{
                Body:{
                    Text:{
                        Data:"AWS Price: " + yesterdayBilling+"$",
                    },
                },
                Subject:{
                    Data: yesterdayISOString + " AWS Billing",
                },
            },
            Source: event.reciever,
        };

        new AWS.SES().sendEmail(params, function(err,result){
            if(err)callback(err);
            else(callback(null))
        })
    });
};
