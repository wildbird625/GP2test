#!/usr/bin/python3
import cgi
#import cgitb; cgitb.enable()  # for troubleshooting
import traceback
import mysql.connector
import re
import smtplib
import secrets
from datetime import datetime, timedelta

regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'  

form = cgi.FieldStorage()
email = form.getvalue('email')

if re.fullmatch(regex, email):
	# Find the user ID
	conn = mysql.connector.connect(host="localhost", port=3306, user="talfaro", passwd="talfaro@3")
	conn.database = 'talfaro'
	cursor = conn.cursor()
	cursor.execute("SELECT `email` FROM `users` WHERE `email` = '" + email + "' LIMIT 1")
	data = cursor.fetchone()
	if data == None:
		# user doesn't exist
		response = 'None'
	else:
		response = data[0]
else:
	response = 'Invalid'
	
print('Content-type: text/plain')
print('Content-length: ', len(response))
print('')
print(response)