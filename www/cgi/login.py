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
email = form.getvalue('email')
password = form.getvalue('password')

#Find the user
conn = mysql.connector.connect(host="localhost", port=3306, user="talfaro", passwd="talfaro@3")
conn.database = 'talfaro'
cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT * FROM `users` WHERE `email` = %s LIMIT 1", (email,))
data = cursor.fetchone()
if data == None:
	response = 'Invalid user'
else:
	#user exists, so check the password
	db_pass = data.get('password')
	user_id = data.get('id')
	if bcrypt.checkpw(password.encode('utf-8'), db_pass.encode('utf-8')): # passwords match
		token = secrets.token_hex(32)
		now = datetime.now()
		expires = now + timedelta(days=365)
		cursor.execute("INSERT INTO `login_tokens` SET `user_id` = %s, `token` = %s, `expires` = %s", (user_id, token, expires.strftime("%Y-%m-%d %H:%M:%S")));
		conn.commit()
		response = json.dumps({ 'token': token, 'expires': expires.strftime("%Y-%m-%d %H:%M:%S"), 'userID': user_id });
	else:
		response = 'Invalid password'

print('Content-type: text/plain')
print('Content-length: ', len(response))
print('')
print(response)