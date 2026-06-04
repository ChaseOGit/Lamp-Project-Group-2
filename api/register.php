<?php
	$inData = getRequestInfo();
	
	$username = $inData["username"];
	$plainPassword = $inData["passwords"];

	//  hash and salt the password using PHP's bcrypt
	$hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "lamp_project");
	
	if ($conn->connect_error) {
		returnWithError($conn->connect_error);
	} else {
		// Insert the new username and the HASHED password into the database
		$stmt = $conn->prepare("INSERT into users (username, passwords) VALUES(?,?)");
		$stmt->bind_param("ss", $username, $hashedPassword);
		
		// Because 'username' is marked as UNIQUE in SQL schema, this execution will 
		// fail if someone tries to register a username that already exists.
		if($stmt->execute()) {
			returnWithError(""); // An empty error string means success
		} else {
			returnWithError("Username already exists.");
		}
		
		$stmt->close();
		$conn->close();
	}

	function getRequestInfo() {
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj ) {
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err ) {
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
?>