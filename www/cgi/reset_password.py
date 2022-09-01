#!/usr/bin/python3
import cgi
#import cgitb; cgitb.enable()  # for troubleshooting
import traceback
import mysql.connector
import smtplib
import re
import bcrypt
from datetime import datetime, timedelta

form = cgi.FieldStorage()
password = form.getvalue('password')
token = form.getvalue('token')

# Find the user ID
conn = mysql.connector.connect(host="localhost", port=3306, user="talfaro", passwd="talfaro@3")
conn.database = 'talfaro'
cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT * FROM `password_resets` WHERE `token` = '" + token + "' LIMIT 1")
data = cursor.fetchone()
if data == None:
	# token doesn't exist
	response = 'Invalid token'
else:
	#token exists, so check used status
	if data.get('used') == None: # token is not used yet
		now = datetime.now()
		expires = data.get('expires')
		if now > expires:
			response = 'Expired token'
		else: # token not expired, so check the password
			if len(password) > 10:
				if re.findall(r'[A-Z]', password):
					if re.findall(r'[a-z]', password):
						if re.findall(r'[0-9]', password):
							hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12))
							cursor.execute("UPDATE `users` SET `password` = %s WHERE `id` = %s LIMIT 1", (hashed_password, data.get('user_id')))
							conn.commit()
							
							#token used and password reset, so update password resets table
							cursor.execute("UPDATE `password_resets` SET `used` = %s WHERE `token` = %s LIMIT 1", (now.strftime("%Y-%m-%d %H:%M:%S"), token))
							conn.commit()
							
							#get the user information
							cursor.execute("SELECT * FROM `users` WHERE `id` = %s LIMIT 1", (data.get('user_id'),))
							data = cursor.fetchone()
							
							#send email that password was reset
							sender = 'talfaro@asu.edu'
							receivers = [data.get('email')]
							message = """From: talfaro <talfaro@asu.edu>
To: {0}
MIME-Version: 1.0
Content-type: text/html
Subject: Password Reset for IFT Student App

<p>Your password for the IFT Student App account associated with this email address has been reset. If you did <b>not</b> reset your password, please contact us immediately and change the password for this email address.</p>
""".format(*[data.get('email')])
							try:
								smtpObj = smtplib.SMTP_SSL('smtp.gmail.com', 465)
								smtpObj.ehlo()
								smtpObj.login('talfaro@asu.edu', 'talfaro@3')
								smtpObj.sendmail(sender, receivers, message)
								smtpObj.close()
								response = 'Success'
							except SMTPException:
								response = 'Email error'
						else:
							response = 'Password invalid'
					else:
						response = 'Password invalid'
				else:
					response = 'Password invalid'
			else:
				response = 'Password invalid'
	else:
		response = 'Used token'
		
print('Content-type: text/plain')
print('Content-length: ', len(response))
print('')
print(response)