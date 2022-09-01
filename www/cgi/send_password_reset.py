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
	cursor.execute("SELECT `id` FROM `users` WHERE `email` = '" + email + "' LIMIT 1")
	data = cursor.fetchone()
	if data == None:
		# user doesn't exist
		response = 'Invalid user'
	else:
		#user exists, so create the token
		userID = data[0]
		token = secrets.token_hex(16)
		now = datetime.now()
		expires = now + timedelta(hours=24)
		cursor.execute("INSERT INTO `password_resets` SET `user_id` = %s, `token` = %s, `expires` = %s", (userID, token, expires.strftime("%Y-%m-%d %H:%M:%S")))
		conn.commit()
		
		#token created so send out
		sender = 'talfaro@asu.edu'
		receivers = [email]
		message = """From: talfaro <talfaro@asu.edu>
To: {0}
MIME-Version: 1.0
Content-type: text/html
Subject: Password Reset for IFT Student App

<p>A password reset was requested for this email address. If you did <b>not</b> request a password reset, you may ignore this message and your password will <b>not</b> be reset. If you <b>do</b> need to reset your password, please use this link: <a href="https://iftweb.eng.asu.edu/talfaro/redirect.php?url=iftapp://reset-password?token={2}">iftapp://reset-password?token={3}</a>. This link will expire in 24 hours.</p>
""".format(*[email,token,token,token])
		try:
			smtpObj = smtplib.SMTP_SSL('smtp.gmail.com', 465)
			smtpObj.ehlo()
			smtpObj.login('talfaro@asu.edu', 'talfaro@3')
			smtpObj.sendmail(sender, receivers, message)
			smtpObj.close()
			response = 'Sent email'
		except SMTPException:
			response = 'Error'
else:
	response = 'Email invalid'
	
print('Content-type: text/plain')
print('Content-length: ', len(response))
print('')
print(response)