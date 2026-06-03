<?php
	$inData = getRequestInfo();
	
	$contact_id = $inData["contact_id"];
	$reference_id = $inData["reference_id"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "lamp_project");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		// Delete specific contact belonging to the specific user
		$stmt = $conn->prepare("DELETE FROM contacts WHERE contact_id=? AND reference_id=?");
		$stmt->bind_param("ii", $contact_id, $reference_id);
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