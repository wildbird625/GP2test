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
password = form.getvalue('password')
     
if re.fullmatch(regex, email):
	if len(password) > 10:
		if re.findall(r'[A-Z]', password):
			if re.findall(r'[a-z]', password):
				if re.findall(r'[0-9]', password):
					hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12))
					now = datetime.now()
					conn = mysql.connector.connect(host="localhost", port=3306, user="talfaro", passwd="talfaro@3")
					conn.database = 'talfaro'
					cursor = conn.cursor()
        
					cursor.execute("SELECT `email` FROM `users` WHERE `email` = '" + email + "' LIMIT 1")
					data = cursor.fetchone()
					if data == None:
						cursor.execute("INSERT INTO `users` SET `email` = %s, `password` = %s, `created` = %s", email, hashed_password, now.strftime("%Y-%m-%d %H:%M:%S"))
						conn.commit()
						
						cursor.execute("SELECT * FROM `users` WHERE `id` = %s LIMIT 1", (data.get('user_id'),))
						data1 = cursor.fetchone()
						if data1 == None:
							response = 'None'
						else:
							response = data1[0]	
					else:
						response = data[0]
				else:
					response = 'Password invalid'
			else:
				response = 'Password invalid'
		else:
			response = 'Password invalid'
	else:
		response = 'Password invalid'
else:
	response = 'Email invalid'
	
print('Content-type: text/plain')
print('Content-length: ', len(response))
print('')
print(response)