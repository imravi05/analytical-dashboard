export const emailTemplate = (verificationOTP) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    /* Base Reset & Typography */
    <style>
body {
    margin: 0;
    padding: 0;
    background-color: #f4f7f6;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333333;
}

/* Wrapper */
.email-wrapper {
    width: 100%;
    background-color: #f4f7f6;
    padding: 40px 0;
}

/* Main Container */
.email-content {
    max-width: 500px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

/* Header */
.email-header {
    background-color: #ffffff;
    padding: 30px;
    text-align: center;
    border-bottom: 1px solid #eeeeee;
}

.logo {
    font-size: 24px;
    font-weight: bold;
    color: #35b125ff;
    text-decoration: none;
    letter-spacing: 1px;
}

/* Body */
.email-body {
    padding: 40px 30px;
    text-align: center;
}

h1 {
    font-size: 22px;
    margin: 0 0 20px;
    color: #2ca444ff;
}   

p {
    font-size: 16px;
    line-height: 1.6;
    color: #666666;
    margin-bottom: 30px;
}

/* Verification Code */
.verification-code {
    display: inline-block;
    padding: 15px 40px;
    margin-bottom: 30px;

    background-color: #f8f9fa;
    border: 2px dashed #007bff;
    border-radius: 6px;

    color: #007bff;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 5px;
}

/* Footer */
.email-footer {
    background-color: #f8f9fa;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: #999999;
}

.email-footer a {
    color: #007bff;
    text-decoration: none;
}

/* Responsive */
@media only screen and (max-width: 600px) {
    .email-content {
        width: 90%;
    }

    .email-body {
        padding: 30px 20px;
    }
}
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-content">
            <div class="email-header">
                <a href="#" class="logo" color="#2ca444ff">Farms<span style=" color:#2ca444ff">Easy</span></a>
            </div>
            <div class="email-body">
                <h1>Verify your email address</h1>
                <p>Thanks for starting the new account creation process. We want to make sure it's really you. Please enter the following verification code when prompted.</p>
                
                <div class="verification-code">
                    ${verificationOTP}
                </div>

                <p style="font-size: 14px; color: #999;">(This code is valid for 10 minutes)</p>
            </div>
            <div class="email-footer">
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>&copy; 2026 FarmsEasy.in<br>
                 All rights reserved.<br>
                <a href="#">Privacy Policy</a> | <a href="#">Support</a></p>
            </div>
        </div>
    </div>
</body>
</html>
`;
};

export const welcomeEmailTemplate = (name) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Your Company</title>
    <style>
        /* Base Styles (Same as before) */
        /* Base Reset & Typography */
body {
    margin: 0;
    padding: 0;
    background-color: #f4f7f6;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333333;
}

/* Wrapper */
.email-wrapper {
    width: 100%;
    background-color: #f4f7f6;
    padding: 40px 0;
}

/* Main Container */
.email-content {
    max-width: 500px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

/* Header */
.email-header {
    background-color: #ffffff;
    padding: 30px;
    text-align: center;
    border-bottom: 1px solid #eeeeee;
}

.logo {
    font-size: 24px;
    font-weight: bold;
    color: #29af66ff;
    text-decoration: none;
    letter-spacing: 1px;
}

/* Body */
.email-body {
    padding: 40px 30px;
    text-align: center;
}

h1 {
    font-size: 22px;
    margin: 0 0 20px;
    color: #1cbf52ff;
}

p {
    font-size: 16px;
    line-height: 1.6;
    color: #666666;
    margin-bottom: 30px;
}

/* Button Style */
.btn {
    display: inline-block;
    padding: 15px 30px;
    margin-bottom: 30px;

    background-color: #007bff; /* Primary Brand Color */
    color: #ffffff;

    font-size: 16px;
    font-weight: bold;
    text-decoration: none;

    border-radius: 6px;
    transition: background-color 0.3s ease;
}

.btn:hover {
    background-color: #0056b3;
}

/* Footer */
.email-footer {
    background-color: #f8f9fa;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: #999999;
}

.email-footer a {
    color: #007bff;
    text-decoration: none;
}

/* Responsive */
@media only screen and (max-width: 600px) {
    .email-content {
        width: 90%;
    }

    .email-body {
        padding: 30px 20px;
    }
}

    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-content">
            
            <div class="email-header">
                <a href="#" class="logo">Farms<span style="color:#007bff;">Easy</span></a>
            </div>

            <div class="email-body">
                <h1>Congratulations, ${name}!</h1>
                <p>Congratulations ${name}. Your account has been successfully verified and is ready to use.
                You are now registered on FarmsEasy.</p>
                <p>You can now explore all the features we have to offer.</p>
                


                <p style="font-size: 14px; color: #999;">If you have any questions, feel free to reply to this email.</p>
            </div>

            <div class="email-footer">
                <p>&copy; 2026 Team FarmsEasy.<br>
                 All rights reserved.<br>
                <a href="#">Privacy Policy</a> | <a href="#">Support</a></p>
            </div>

        </div>
    </div>
</body>
</html>
`;
};