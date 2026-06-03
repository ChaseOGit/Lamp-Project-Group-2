<?php
	$inData = getRequestInfo();
	
	$searchResults = "";
	$searchCount = 0;

	// Database connection using your specified schema name 
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "lamp_project");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		// Updated to search your 'contacts' table using 'c_name' and 'reference_id' 
		$stmt = $conn->prepare("select * from contacts where c_name like ? and reference_id=?");
		$searchName = "%" . $inData["search"] . "%";
		$stmt->bind_param("si", $searchName, $inData["reference_id"]);
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;
			// Returning a full JSON object for each contact as per assignment requirements 
			$searchResults .= '{"c_name":"' . $row["c_name"] . '", "phone":"' . $row["phone"] . '", "email":"' . $row["email"] . '", "contact_id":' . $row["contact_id"] . '}';
		}
		
		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
		}
		
		$stmt->close();
		$conn->close();
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
		$retValue = '{"results":[],"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
?>