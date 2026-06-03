<?php
	$inData = getRequestInfo();
	
	$contact_id = $inData["contact_id"];
	$c_name = $inData["c_name"];
	$phone = $inData["phone"];
	$email = $inData["email"];
	$reference_id = $inData["reference_id"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "lamp_project");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		// Update contact details while verifying ownership via reference_id
		$stmt = $conn->prepare("UPDATE contacts SET c_name=?, phone=?, email=? WHERE contact_id=? AND reference_id=?");
		$stmt->bind_param("sssii", $c_name, $phone, $email, $contact_id, $reference_id);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
?>