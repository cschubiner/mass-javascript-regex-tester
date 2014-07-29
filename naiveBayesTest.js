var fs = require('fs');
var Q = require('q');
var jf = require('jsonfile');
var _ = require('underscore');
var a = console.log;
var colors = require('colors');

var LOG_FALSE_POSITIVE = false;
var LOG_FALSE_NEGATIVE = false;

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

function logError(str) {
  console.log(str.error);
}

function writeResultsToFile(results) {
  var resultsFile = 'results.json';
  fs.writeFile(resultsFile, JSON.stringify(results).replace(/,/g, '\n'), function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log("The results were saved to " + resultsFile);
    }
  });
}

function readJSONFile(fileName, isPositive) {
  return _.map(jf.readFileSync(fileName), function (testString) {
    return {
      testString: testString,
      isPositive: isPositive
    };
  });
}

function evaluateTest() {
  var ret = {
    truePositives: 0,
    trueNegatives: 0,
    falsePositives: 0,
    falseNegatives: 0,
    total: testStrings.length
  };
  for (var index in testStrings) {
    var testString = testStrings[index];
    var result = classifier.classify(testString.testString);
    result = result === 'pos';

    if (testString.isPositive) {
      if (result) {
        ret.truePositives += 1;
      }
      else {
        ret.falseNegatives += 1;
        if (LOG_FALSE_NEGATIVE)
          console.log("\n------------- FALSE NEGATIVE -------------\n\t".error +
            testString.testString +
            '\n------------------------------------------'.error);
      }
    }
    else {
      if (result) {
        ret.falsePositives += 1;
        if (LOG_FALSE_POSITIVE)
          console.log("\n------------- FALSE POSITIVE -------------\n\t".error +
            testString.testString +
            '\n------------------------------------------'.error);
      }
      else {
        ret.trueNegatives += 1;
      }
    }
  }
  ret.accuracy = (ret.truePositives + ret.trueNegatives) / ret.total;
  return ret;
}

function shuffle(array) {
  var counter = array.length,
    temp, index;
  while (counter > 0) {
    index = Math.floor(Math.random() * counter);
    counter--;
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
}

function runTest() {
  var testResult = evaluateTest();
  a(testResult);
  writeResultsToFile(testResult);
}

var natural = require('natural');
var classifier = new natural.BayesClassifier();
var NGrams = natural.NGrams;

var positiveStrings = readJSONFile('./tests/positiveStrings.json', true);
var negativeStrings = readJSONFile('./tests/negativeStrings.json', false);
var testStrings = shuffle(positiveStrings.concat(negativeStrings));

_.each(testStrings, function (testString) {
  classifier.addDocument(JSON.stringify(NGrams.bigrams(testString.testString)), testString.isPositive ?
    'pos' :
    'neg');
});
_.each(testStrings, function (testString) {
  classifier.addDocument(testString.testString, testString.isPositive ?
    'pos' :
    'neg');
});
a('Training...');
classifier.train();

runTest();
