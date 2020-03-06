import os

basestr = 'name\n'
for fname in os.listdir('398_REPORT_ALL CITIES'):
	basestr = basestr + fname + '\n'


f = open("file_strings.csv", "w")
f.write(basestr)
print(basestr)