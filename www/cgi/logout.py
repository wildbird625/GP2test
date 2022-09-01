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
	response = 'Success' # token is not found so the user is basically logged out
else:
	cursor.execute("DELETE FROM `login_tokens` WHERE `token` = %s LIMIT 1", (token,));
	conn.commit();
	response = 'Success'

print('Content-type: text/plain')
print('Content-length: ', len(response))
print('')
print(response)