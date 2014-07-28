import os

inputFileName = 'remainingStrings.txt'
def getInputFromUser():
    while True:
        yesOrNoInput = raw_input("Does this input contain an error message? Enter '1' for yes, '2' for no, '3' for unsure, or 'q' for quit: ")
        if yesOrNoInput != '1' and yesOrNoInput != '2' and yesOrNoInput != 'q' and yesOrNoInput != '3':
            continue
        return yesOrNoInput

negativeStringFileName = 'negativeStrings-Python.json'
positiveStringFileName = 'positiveStrings-Python.json'
unsureStringFileName = 'unsureStrings-Python.json'

files = {
    negativeStringFileName: open(negativeStringFileName, 'a'),
    positiveStringFileName: open(positiveStringFileName, 'a'),
    unsureStringFileName: open(unsureStringFileName, 'a')
}

def appendStringToFile(fileName, string):
    files[fileName].write(string)

startIndex = int(raw_input('Start at index: '))
count = startIndex - 1
allLines = open(inputFileName, 'r').readlines()

totalLines = len(allLines)
for line in allLines[startIndex:]:
    count += 1
    print line
    print '------- File index:' + str(count) + ' Percent done: ' + str(100*float(count)/totalLines) + '% --------'
    userInput = getInputFromUser()
    if userInput == 'q':
        for f in files:
            files[f].close()
        break
    if userInput == '1':
        appendStringToFile(positiveStringFileName, line)
    elif userInput == '3':
        appendStringToFile(unsureStringFileName, line)
    else:
        appendStringToFile(negativeStringFileName, line)
    os.system('clear')
    print '\n\n\n\n\n'
