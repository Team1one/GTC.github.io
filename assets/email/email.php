<?php

header('Content-type: application/json');

$errors = '';

if(empty($errors))
{
	$json = file_get_contents("php://input");
	$params = json_decode($json);

	$name = $params->name;
	$phone = $params->phone;
	$email = $params->email;
	$message = $params->message;

	$recipient = 'samwg16@gmail.com';

	$subject = 'New GTC Bridal Message';
	$headers = "From: $name <$email>";

	$contact = "<p>Name: $name</p>
				<p>Contact: $phone</p>
				<p>Email: $email</p>";
	$content = "<p>$message</p>";


	$email_body = '<html><body>';
	$email_body .= "$contact $content";
	$email_body .= '</body></html>';
 
	$headers = "MIME-Version: 1.0\r\n";
	$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
	$headers .= "From: $name <$email>";

	mail($recipient,$subject,$email_body,$headers);

	$response_array['status'] = 'success';
	$response_array['from'] = $email;
	echo json_encode($response_array);
	echo json_encode($email);
	header($response_array);
	return $email;
} else {
	$response_array['status'] = 'error';
	echo json_encode($response_array);
	header('Location: /error.html');
}
?>

