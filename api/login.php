<?php
	$inData = getRequestInfo();
	
	$id = 0;
	$username = "";

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "lamp_project"); 	
	if( $conn->connect_error ) {
		returnWithError( $conn->connect_error );
	} else {
		$stmt = $conn->prepare("SELECT user_id, username FROM users WHERE username=? AND passwords=?");
		$stmt->bind_param("ss", $inData["username"], $inData["passwords"]);
		$stmt->execute();
		$result = $stmt->get_result();

		if( $row = $result->fetch_assoc() ) {
			returnWithInfo($row['username'], $row['user_id']);
		} else {
			returnWithError("No Records Found");
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
		$retValue = '{"user_id":0,"username":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $username, $id ) {
		$retValue = '{"user_id":' . $id . ',"username":"' . $username . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
?>