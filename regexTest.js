var fs = require('fs');
var Q = require('q');
var jf = require('jsonfile');
var _ = require('underscore');
var a = console.log;
var colors = require('colors');

var LOG_FALSE_POSITIVE = true;
var LOG_FALSE_NEGATIVE = true;

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

function doesStringMatch(testString, regexStr) {
  var regex = new RegExp(regexStr, 'gi');
  return regex.test(testString);
}

function readJSONFile(fileName, isPositive) {
  return _.map(jf.readFileSync(fileName), function (testString) {
    return {
      testString: testString,
      isPositive: isPositive
    };
  });
}

function validateString(testString, regexStrings) {
  for (var index in regexStrings) {
    var regexStr = regexStrings[index];
    if (doesStringMatch(testString, regexStr))
      return true;
  }
  return false;
}

function evaluateRegexes(regexes) {
  var ret = {
    truePositives: 0,
    trueNegatives: 0,
    falsePositives: 0,
    falseNegatives: 0,
    total: testStrings.length
  };
  for (var index in testStrings) {
    var testString = testStrings[index];
    var result = validateString(testString.testString, regexes);
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
  return ret;
}

function writeResultsToFile(results) {
  var resultsFile = 'results.json';
  fs.writeFile(resultsFile, JSON.stringify(results), function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log("The results were saved to " + resultsFile);
    }
  });
}

function runTest(regexes) {
  var testResult = evaluateRegexes(regexes);
  a(testResult);
  writeResultsToFile(testResult);
}

function loadAndEvaluateRegexes(fileName) {
  var ret = [];
  return require('readline').createInterface({
    input: fs.createReadStream(fileName),
    terminal: false
  }).on('line', function (line) {
    ret.push(line);
  }).on('close', function () {
    runTest(ret);
  });
}

var positiveStrings = readJSONFile('./tests/positiveStrings.json', true);
var negativeStrings = readJSONFile('./tests/negativeStrings.json', false);
var testStrings = positiveStrings.concat(negativeStrings);

loadAndEvaluateRegexes('./tests/regexStrings.txt');

// console.log(doesStringMatch('abc', 'a'));
