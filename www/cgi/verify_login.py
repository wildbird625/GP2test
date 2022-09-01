#!/usr/bin/python3
import cgi
#import cgitb; cgitb.enable()  # for troubleshooting
import traceback
import mysql.connector
import smtplib
import re
import bcrypt
import secrets
import json
from datetime import datetime, timedelta

form = cgi.FieldStorage()
token = form.getvalue('token')

#Find the user
conn = mysql.connector.connect(host="localhost", port=3306, user="talfaro", passwd="talfaro@3")
conn.database = 'talfaro'
cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT * FROM `login_tokens` WHERE `token` = %s LIMIT 1", (token,))
data = cursor.fetchone()
if data == None:
	response = 'Invalid'
else:
	now = datetime.now()
	if now < data.get('expires'):
		response = 'Success' # token is found and not expired
	else:
		response = 'Expired'

print('Content-type: text/plain')
print('Content-length: ', len(response))
print('')
print(response)