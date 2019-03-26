var csv = require("fast-csv");
var fs = require('fs');
var axios = require('axios');
var config = require('./config');

const LRS_ENDPOINT = 'https://saas.learninglocker.net';
const LRS_AUTH = 'MDk1MzJiN2I4N2Y3Mjk0ZGFmYTJlNDI5MWNmNDVhYWU2MjlkNDE4ZjpmZDY5ZDU2YmFhY2UyNzIyYTkxMmUyZWQ5MWQwMDQ5YjliMzM5ZTM4';
const LRS_VERSION = '1.0.3';
const URI_STATEMENT = '/data/xAPI/statements';

// Set the config
const config = {
    headers: {
        Authorization: 'Basic ' + LRS_AUTH,
        'X-Experience-API-Version': LRS_VERSION,
        'Content-Type': 'application/json'
    }
}

// Read CSV file to load into Learning Locker
var stream = fs.createReadStream("./data/data.csv");
 
var csvoptions = {
    headers : true,
    ignoreEmpty: true
}

var myPromises = [];

csv
 .fromStream(stream, csvoptions)
 .on("data", function(data){
    console.log(data);
    var statement = buildStatement(data);
    console.log('statement', statement);
    return sendStatementToLearningLocker(statement)
    .then( data => console.log('line done', data))
    .catch( error => {
        // console.log(' line error', error)
        console.log(' ############################# ERROR', error.response.data)
    })
 })
 .on("end", function(){
     console.log("done");
 });

function buildStatement(data) {
    return {
        actor: {
            objectType: 'Agent',
            name: data.name,
            mbox: 'mailto:'+data.actor
        },
        verb: {
            id : "http://adlnet.gov/expapi/verbs/attended",
            display : {
                "en-GB" : "attended",
                "en-US" : "attended"
            }
        },
        object: {
            objectType: 'Activity',
            id: 'http://www.example.com/meetings/occurances/34534'
        },
        version: '1.0.1',
        timestamp: "2019-01-01T09:41:58.136Z"
    } 
}

const sendStatementToLearningLocker = (statement) => {
    // http://docs.learninglocker.net/http-xapi-statements/
    try {
        return axios.post(LRS_ENDPOINT + URI_STATEMENT, [statement], config)
    } catch (error) {
        console.error(error);
    }
}