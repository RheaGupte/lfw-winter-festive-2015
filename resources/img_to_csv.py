import csv
from os import listdir
from os.path import isfile, join

# Get list of files from images/ folder
mypath = 'images'
onlyfiles = [ f for f in listdir(mypath) if isfile(join(mypath,f)) ]

# Split filenames to make our data array
data = [ [ "trend", "designer", "score", "filename" ] ]
for filename in onlyfiles:
	trend = filename.split( '_' )[ 0 ]
        designer = filename.split( '_' )[ 1 ].split( 'at' )[ 0 ]
	score = 1
	data.append( [ trend, designer, score, filename ] )

# Write data to file
csv_out = open( 'trends.csv', 'wb' )
mywriter = csv.writer( csv_out, quoting=csv.QUOTE_ALL )
mywriter.writerows( data )
