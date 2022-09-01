// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
	
}

var currentView = 'login';
var checkEmailTimer;
var passInputTimer;
var confirmPassInputTimer;
var checkScreenNameTimer;
var noLoginViews = ['login', 'reset-password', 'forgot-password', 'sign-up'];

function checkLogin() {
	var requireLogin = true;
	for(var i = 0; i < noLoginViews.length; i++) {
		if(currentView == noLoginViews[i]) requireLogin = false;
	}

	var isLoggedIn = false;
	if(window.localStorage.getItem('auth')) {
		var auth = JSON.parse(window.localStorage.getItem('auth'));
		var now = new Date();
		var tmp = auth.expires.replace(/\D/g, ''); // removes all non-digits
		var expires = new Date(tmp.substr(0,4), tmp.substr(4,2), tmp.substr(6,2), tmp.substr(8,2), tmp.substr(10,2), tmp.substr(12,2));
		if(expires < now) { // user login token is expired
			window.localStorage.removeItem('auth');
			isLoggedIn = false;
		} else {
			isLoggedIn = true;
		}
	}
	
	if(requireLogin) {
		if(!isLoggedIn) renderView('login');
		else renderView();
	} else {
		if(isLoggedIn) renderView('home');
	}
}

$(function() {
	$('.nav-toggle').on('click', function(e) {
		e.preventDefault();
		$(this).toggleClass('toggled');
		$('.menu').toggleClass('open');
	});
	
	$('.menu a').on('click', function(e) {
		e.preventDefault();
		$('.nav-toggle').toggleClass('toggled');
		$('.menu').toggleClass('open');
		var view = $(this).attr('href');
		if(view == '#' && $(this).hasClass('logout')) doLogout();
		else renderView(view);
	});
	
	$('a.item').on('click', function(e) {
		e.preventDefault();
		var view = $(this).attr('href');
		renderView(view);
	});

	$('.show-hide-password').on('click', function() {
		$(this).toggleClass('showing');
		if($(this).hasClass('showing')) $(this).closest('.input-group').find('input').attr('type', 'text').focus();
		else $(this).closest('.input-group').find('input').attr('type', 'password').focus();
	});
	
	$('#forgot-password input[type="email"]').on('input paste', function() {
		clearTimeout(checkEmailTimer);
		$('#forgot-password .email-check .email-question').show();
		$('#forgot-password .email-check .email-okay, #forgot-password .email-check .email-not-okay, #forgot-password .email-check .email-checking').hide();
		hideError($('.email-error'), $('.email-group'));
		checkEmailTimer = setTimeout(function() {
			var email = $('#forgot-password input[type="email"]').val();
			if(email != '') {
				if(validateEmail(email)) {
					$('#forgot-password .email-check .email-question').hide();
					$('#forgot-password .email-check .email-okay').show();
				} else {
					$('#forgot-password .email-check .email-question').hide();
					$('#forgot-password .email-check .email-not-okay').show();
					showError($('#forgot-password .email-error'), 'Invalid email', $('#forgot-password .email-group'));
				}
			}

			var signUpEmail = $('#sign-up-email').val();
			if(signUpEmail != '') {
				if(validateEmail(signUpEmail)) {
					$('#sign-up .email-check .email-question').hide();
					$('#sign-up .email-check .email-checking').show();

					$.ajax({
						url: 'https://iftweb.eng.asu.edu/talfaro/www/cgi/check_email_exists.py',
						type: 'POST',
						data: {
							email: signUpEmail
						},
						success: function(data) {
							if (data == signUpEmail){
								$('#sign-up .email-check .email-checking').hide();
								$('#sign-up .email-check .email-not-okay').show();
								showError($('#sign-up .email-error'), $('#sign-up .email-group'));
							} else if (data=='None'){
								$('#sign-up .email-check .email-checking').hide();
								$('#sign-up .email-check .email-okay').show();
							} else if (data=='Invalid'){
								$('#sign-up .email-check .email-checking').hide();
								$('#sign-up .email-check .email-not-okay').show();
								showError($('#sign-up .email-error'), $('#sign-up .email-group'));
							} 
						},
						complete: function(response) {
							console.log(response);
						}
					});
				} else {
					$('#sign-up .email-check .email-question').hide();
					$('#sign-up .email-check .email-not-okay').show();
					showError($('#sign-up .email-error'), $('#sign-up .email-group'))
				}
			}
		}, 500);
	});
	
	$('#reset-password-password').on('input paste', function() {
		clearTimeout(passInputTimer);
		hideError($('#reset-password .password-error'), $('#reset-password .password-group'));
		passInputTimer = setTimeout(function() {
			var pass = $('#reset-password-password').val();
			if(pass.length == 0) return false;
			else if(pass.length < 10) showError($('#reset-password .password-error'), 'too short', $('#reset-password .password-group'));
			else if(!pass.match(/[A-Z]+/g)) showError($('#reset-password .password-error'), 'needs uppercase letters', $('#reset-password .password-group'));
			else if(!pass.match(/[a-z]+/g)) showError($('#reset-password .password-error'), 'needs lowercase letters', $('#reset-password .password-group'));
			else if(!pass.match(/[0-9]+/g)) showError($('#reset-password .password-error'), 'needs numbers', $('#reset-password .password-group'));
		}, 500);
	});

	$('#reset-password-confirm-password').on('input paste', function() {
		clearTimeout(confirmPassInputTimer);
		hideError($('#reset-password .confirm-password-error'), $('#reset-password .confirm-password-group'));
		confirmPassTimer = setTimeout(function() {
			var pass = $('#reset-password-password').val();
			var confirm = $('#reset-password-confirm-password').val();
			if(pass != confirm) showError($('#reset-password .confirm-password-error'), 'must match', $('#reset-password .confirm-password-group'));
		}, 500);
	});
	
	$('#login-email').on('input paste', function() {
		clearTimeout(checkEmailTimer);
		$('#login .email-check .email-question').show();
		$('#login .email-check .email-okay, #login .email-check .email-not-okay, #login .email-check .email-checking').hide();
		hideError($('#login .email-error'), $('#login .email-group'));
		checkEmailTimer = setTimeout(function() {
			var email = $('#login-email').val();
			if(email != '') {
				if(validateEmail(email)) {
					$('#login .email-check .email-question').hide();
					$('#login .email-check .email-okay').show();
				} else {
					$('#login .email-check .email-question').hide();
					$('#login .email-check .email-not-okay').show();
					showError($('#login .email-error'), 'Invalid email', $('#login .email-group'));
				}
			}
		}, 500);
	});
	
	$('#login-password').on('input paste', function() {
		clearTimeout(passInputTimer);
		hideError($('#login .password-error'), $('#login .password-group'));
		passInputTimer = setTimeout(function() {
			var pass = $('#login-password').val();
			if(pass.length == 0) return false;
			else if(pass.length < 10) showError($('#login .password-error'), 'too short', $('#login .password-group'));
			else if(!pass.match(/[A-Z]+/g)) showError($('#login .password-error'), 'needs uppercase letters', $('#login .password-group'));
			else if(!pass.match(/[a-z]+/g)) showError($('#login .password-error'), 'needs lowercase letters', $('#login .password-group'));
			else if(!pass.match(/[0-9]+/g)) showError($('#login .password-error'), 'needs numbers', $('#login .password-group'));
		}, 500);
	});

	$("#sign-up-email").on("input paste", function () {
    $("#sign-up .email-check .email-question").show();
    $(
      "#sign-up .email-check .email-okay, #sign-up .email-check .email-not-okay, #sign-up .email-check .email-checking"
    ).hide();
    hideError($("#sign-up .email-error"), $("#sign-up .email-group"));
  });
	
	$("#sign-up-password").on("input paste", function () {
    clearTimeout(passInputTimer);
    hideError($("#sign-up .password-error"), $("#sign-up .password-group"));
    passInputTimer = setTimeout(function () {
      var pass = $("#sign-up-password").val();
      if (pass.length == 0) return false;
      else if (pass.length < 10) {
        showError(
          $("#sign-up .password-error"),
          "too short",
          $("#sign-up .password-group")
        );
      } else if (!pass.match(/[A-Z]+/g)) {
        showError(
          $("#sign-up .password-error"),
          "needs uppercase letters",
          $("#sign-up .password-group")
        );
      } else if (!pass.match(/[a-z]+/g)) {
        showError(
          $("#sign-up .password-error"),
          "needs lowercase letters",
          $("#sign-up .password-group")
        );
      } else if (!pass.match(/[0-9]+/g)) {
        showError(
          $("#sign-up .password-error"),
          "needs numbers",
          $("#sign-up .password-group")
        );
      }
    }, 500);
  });
	
	$("#sign-up-confirm-password").on("input paste", function () {
		clearTimeout(confirmPassInputTimer);
		hideError(
			$("#sign-up .confirm-password-error"),
			$("#sign-up .confirm-password-group")
		);
		confirmPassInputTimer = setTimeout(function () {
			var pass = $("#sign-up-password").val();
			var confirm = $("#sign-up-confirm-password").val();
			if (pass != confirm) {
				showError(
					$("#sign-up .confirm-password-error"),
					"must match",
					$("#sign-up .confirm-password-group")
				);
			}
		}, 500);
	});
	
	checkLogin();
	renderView();
	
	$('.btn').on('click', function(e) {
		e.preventDefault();
		handleButtonClick($(this));
	});
});

function handleButtonClick(el) {
	var view = $(el).attr('href');
	if(view != '#' && view != '') renderView(view);
	else {
		var id = $(el).attr('id');
		if(id == 'login-btn') {
			console.log('Logging in');
			var emailOK = $('.email-okay').is(':visible');
			if(!emailOK) return false;
			
			var passOK = true;
			var pass = $('#login-password').val();
			if(pass.length == 0) {
				showError($('#login .password-error'), 'enter a password', $('#login .password-group'));
				passOK = false;
			} else if($('#login .password-error').is(':visible')) passOK = false;
			
			if(!passOK) return false;
			showLoading();
			$.ajax({
				url: 'https://iftweb.eng.asu.edu/talfaro/www/cgi/login.py',
				type: 'POST',
				data: {
					email: $('#login-email').val(),
					password: $('#login-password').val()
				},
				success: function(data) {
					hideLoading();
					var response;
					try {
						response = JSON.parse(data);
						window.localStorage.setItem('auth', data);
						if(currentView == 'login') renderView('home');
						else renderView();
					} catch(e) {
						if(data == 'Invalid password') {
							renderModal('Password incorrect!', '<p>The password you entered did not match our records for the email address you entered. Please try again.</p>', true);
						} else if(data == 'Invalid user') {
							renderModal('Email incorrect', '<p>There is no account associated with the email address you entered. Please check the email address and try again. You can create an account by clicking the "Create Account" button below.</p><a href="sign-up" class="btn"><i class="fa-solid fa-user-plus"></i> create account</a>', true);
						}
					}
				},
				complete: function(response) {
					console.log(response);
				}
			});
		} else if(id == 'forgot-password-btn') {
			var emailOK = $('#forgot-password .email-okay').is(':visible');
			if(!emailOK) return false;
			else {
				showLoading();
				$.ajax({
					url: 'https://iftweb.eng.asu.edu/talfaro/www/cgi/send_password_reset.py',
					type: 'POST',
					data: {
						email: $('#forgot-password input[type="email"]').val()
					},
					success: function(data) {
						hideLoading();
						if(data == 'Sent email') { // the account was created
							renderModal('Reset Link Sent!','<p>A reset link was sent to the email you entered. Please check your email and remember, it might have gone to a SPAM or junk folder.</p><a href="login" class="btn"><i class="fa-solid fa-circle-arrow-left"></i> Back to login</a>', true);
						} else if(data == 'Error') {
							renderModal('Error!','<p>There was an error trying to send the reset link. Please contact an administrator.</p>', true);
						} else if(data == 'Invalid user') {
							renderModal('Account Doesn\'t Exist!','<p>There is no account with that email address. Please create an account using the "Create Account" button below.</p><a href="sign-up" class="btn"><i class="fa-solid fa-user-plus"></i> Create account</a><a href="login" class="btn"><i class="fa-solid fa-circle-arrow-left"></i> Back to login</a>', true);
						} else if(data == 'Email invalid') {
							renderModal('Email Address Invalid!', '<p>The email address you entered was invalid. Please enter a valid email address and try again.</p>', true);
						}					
					},
					complete: function(response) {
						console.log(response);
					}
				});
			}			
		} else if(id == 'create-account-btn') {
			var emailOK = $("#sign-up .email-okay").is(":visible");
      var passOK = true;
      if ($("#sign-up-password").val() == "") {
        showError(
          $("#sign-up .password-error"),
          "enter a password",
          $("#sign-up .password-group")
        );
        passOK = false;
      } else if ($("#sign-up .password-error").is(":visible")) passOK = false;

      if ($("sign-up-confirm-password").val() == "") {
        showError(
          $("#sign-up .confirm-password-error"),
          "passwords must match",
          $("#sign-up .confirm-password-group")
        );
        passOK = false;
      } else if ($("#sign-up .confirm-password-error").is(":visible"))
        passOK = false;

      if (!emailOK || !passOK) {
        return false;
      } else {
        showLoading();
        $.ajax({
          url: "https://iftweb.eng.asu.edu/talfaro/www/cgi/add_user.py",
          type: "POST",
          data: {
            email: $("#sign-up-email").val(),
            password: $("#sign-up-password").val(),
          },
          success: function (data) {
            hideLoading();
            window.localStorage.removeItem("reset-password-token");
            if (data == $("#sign-up-email").val()) {
              renderModal(
                "Account created!",
                "<p>Your account was successfully created! You may now login using the username and password you entered",
                true
              );
            } else if (data == "None") {
              renderModal(
                "Error!",
                '"<p>There was an error trying to create your account. Please contact an administrator.</p>',
                true
              );
            } else if (data == "Exists") {
              renderModal(
                "Account already exists",
                '<p>An account with that email already exists. If you have forgotten your password, please use the "Reset Password" button below. Otherwise, please login using your email and password.</p><a href="forgot-password" class="btn"><i class="fa-solid fa-circle-arrow-left"></i> Reset Password</a><a href="login" class="btn"><i class="fa-solid fa-circle-arrow-left"></i> Back to login</a>',
                true
              );
            } else if (data == "Password invalid") {
              renderModal(
                "Password invalid!",
                '"<p>The password you entered was invalid. A valid password matches the following criteria:</p><ul><li>is at least 10 characters</li><li>contains at least one uppercase letter (A - Z)</li><li>contains at least one lowercase letter (a - z)</li><li>contains at least one number (0 - 9)</li></ul><p>Please enter a valid password and try again.</p>',
                true
              );
            } else if (data == "Email invalid") {
              renderModal(
                "Email invalid!",
                '"<p>The email address you entered was invalid. Please enter a valid email address and try again.</p>',
                true
              );
            }
          },
          complete: function (response) {
            console.log(response);
          },
        });
      }

		} else if(id == 'reset-password-btn') {
			var passOK = true;
			if($('#reset-password-password').val() == '') {
				showError($('#reset-password .password-error'), 'enter a password', $('#reset-password .password-group'));
				passOK = false;
			} else if($('#reset-password .password-error').is(':visible')) passOK = false;
	
			if($('#reset-password-confirm-password').val() == '') {
				showError($('#reset-password .confirm-password-error'), 'enter a password', $('#reset-password .confirm-password-group'));
				passOK = false;
			} else if($('#reset-password .confirm-password-error').is(':visible')) passOK = false;
	
			if(!passOK) return false;
			else {
				showLoading();
				$.ajax({
					url: 'https://iftweb.eng.asu.edu/talfaro/www/cgi/reset_password.py',
					type: 'POST',
					data: {
						password: $('#reset-password-password').val(),
						token: window.localStorage.getItem('reset-password-token')
					},
					success: function(data) {
						hideLoading();
						window.localStorage.removeItem('reset-password-token'); // remove the token so it can't be used again
						if(data == 'Success') { // the account was created
							renderModal('Password Reset!', '<p>Your password was reset successfully! You can now login using your new password.</p><a href="login" class="btn"><i class="fa-solid fa-circle-arrow-left"></i> Back to Login</a>', true);
						} else if(data == 'Email error') {
							renderModal('Error!', '<p>Your password was reset successfully, but there was an error send a confirmation email to your email address. You can now login using your new password. Please check to make sure your email address is working.</p><a href="login" class="btn"><i class="fa-solid fa-circle-arrow-left"></i> Back to Login</a>', true);
						} else if(data == 'Expired token') {
							renderModal('Expired Reset Link!', '<p>The reset link you used seems to have expired. Reset links are only valid for 24 hours from when they were sent. You can send a new reset link by click on the "Forgot Password" button below.</p><a href="forgot-password" class="btn"><i class="fa-solid fa-circle-question"></i> forgot password</a>', true);
						} else if(data == 'Invalid token') {
							renderModal('Invalid Reset Link!', '<p>It appears the reset link you used to reset your password was invalid. You can send yourself a valid reset link by clicking on the "Forgot Password" button below.</p><a href="forgot-password" class="btn"><i class="fa-solid fa-circle-question"></i> Forgot password</a>', true);
						} else if(data == 'Used token') {
							renderModal('Reset Link Already Used!', '<p>The reset link you used to reset your password has already been used. Reset links are only valid for one use. To send yourself a new reset link, click on the "Forgot Password" button below.</p><a href="forgot-password" class="btn"><i class="fa-solid fa-circle-question"></i> forgot password</a>', true);
						} else if(data == 'Password invalid') {
							renderModal('Password Invalid!', '<p>The password you entered was invalid. A valid password matches the following criteria:</p><ul><li>is at least 10 characters long</li><li>contains at least one uppercase letter (A - Z)</li><li>contains at least one lowercase letter (a - z)</li><li>contains at least one number (0 - 9)</li></ul><p>Please enter a valid password and try again.</p>', true);
						}
					},
					complete: function(response) {
						console.log(response);
					}
				});
			}
		} else if(id == 'logout-btn') {
			doLogout();
		}
	}
}

function doLogout() {
	if(!window.localStorage.getItem('auth')) renderView('login');
	else {
		var auth = JSON.parse(window.localStorage.getItem('auth'));
		$.ajax({
			url: 'https://iftweb.eng.asu.edu/talfaro/www/cgi/logout.py',
			type: 'POST',
			data: {
				token: auth.token
			},
			success: function(data) {
				if(data == 'Success') {
					window.localStorage.removeItem('auth');
					renderView('login');
				}
			},
			complete: function(response) {
				console.log(response);
			}
		});
	}
}

function renderView(view = '') {
	if(view == '') view = currentView;
	else currentView = view;
	
	var hideNavViews = ['login','forgot-password','reset-password','sign-up'];
	if(hideNavViews.indexOf(view) != -1) $('.nav, .menu').hide();
	else $('.nav, .menu').show();
	
	$('.view').removeClass('showing');
	$('#' + view).addClass('showing');
	if(noLoginViews.indexOf(view) == -1) { // view requires login
		var loginVerified = verifyLogin().done(function(data) {
			if(data != 'Success') {
				renderView('login');
				return false;
			}
		});
		console.log(loginVerified);
		if(!loginVerified) return false;
	}
	
	if(view == 'home') {
		$('.app-title').html('IFT Student App');
	} else if(view == 'profile') {
		$('.app-title').html('Profile');
	} else if(view == 'chat') {
		$('.app-title').html('Chat');
	} else if(view == 'calendar') {
		$('.app-title').html('Calendar');
	} else if(view == 'email') {
		$('.app-title').html('Messaging');
	} else if(view == 'games') {
		$('.app-title').html('Games');
	} else if(view == 'inspiration') {
		$('.app-title').html('Inspiration');
	}
}

function renderModal(title = '', body = '', close = false) {
	var html = '<div class="modal"><div class="modal-body">';
	if(title != '') html += '<h3>' + title + '</h3>';
	html += body;
	if(close) html += '<a href="#" class="btn close-btn"><i class="fa-solid fa-circle-xmark"></i> Close</a>';
	html += '</div></div>';

	$('.modal').remove();
	$('body').append(html);
	$('.modal').css('display','flex').hide().fadeIn();
	if(close) $('.modal .close-btn').off('click').on('click', function(e) {
		e.preventDefault();
		$(this).closest('.modal').fadeOut().hide().css('display','none');
	});
	$('.btn').off('click').on('click', function(e) {
		e.preventDefault();
		$('.modal').fadeOut().hide().css('display','none');
		handleButtonClick($(this));
	});
}

function showLoading() {
	$('.modal').remove();
	$('body').append('<div class="modal"><div class="modal-body" style="text-align: center;"><i class="fa-solid fa-circle-notch fa-spin fa-10x"></i></div></div>');
	$('.modal').css('display','flex').hide().fadeIn();
}

function hideLoading() {
	$('.modal').fadeOut().hide().css('display','none');
}

function validateEmail(email) {
	var pattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
	if(pattern.test(email)) return true;
	else return false;
}

function showError(el, msg, groupEl) {
	$(el).html(msg).show();
	$(groupEl).addClass('error');
}

function hideError(el, groupEl) {
	$(el).hide();
	$(groupEl).removeClass('error');
}

function verifyLogin() {
	if(!window.localStorage.getItem('auth')) return false;
	var auth = JSON.parse(window.localStorage.getItem('auth'));
	return $.ajax({
		url: 'https://iftweb.eng.asu.edu/talfaro/www/cgi/verify_login.py',
		type: 'POST',
		data: {
			token: auth.token
		},
		success: function(data) {
			console.log(data);
		},
		complete: function(response) {
			console.log(response);
		}
	});
}