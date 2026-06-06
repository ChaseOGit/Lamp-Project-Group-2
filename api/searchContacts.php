<?php
    $inData = getRequestInfo();

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "lamp_project");

    if ($conn->connect_error) 
    {
        returnWithError($conn->connect_error);
        exit();
    }

    // Validate expected input
    if (!isset($inData["search"]) || !isset($inData["reference_id"]))
    {
        returnWithError("Missing search or reference_id");
        $conn->close();
        exit();
    }

    $searchTerm = "%" . $inData["search"] . "%";
    $referenceId = intval($inData["reference_id"]);

    /*
        Search any contact text field:
        - c_name
        - email
        - phone

        The reference_id condition keeps results limited to the logged-in user's contacts.
    */
    $stmt = $conn->prepare(
        "SELECT contact_id, c_name, phone, email 
         FROM contacts 
         WHERE reference_id = ? 
         AND (
            c_name LIKE ? 
            OR email LIKE ? 
            OR phone LIKE ?
         )"
    );

    if (!$stmt)
    {
        returnWithError($conn->error);
        $conn->close();
        exit();
    }

    $stmt->bind_param("isss", $referenceId, $searchTerm, $searchTerm, $searchTerm);
    $stmt->execute();

    $result = $stmt->get_result();

    $searchResults = array();

    while ($row = $result->fetch_assoc())
    {
        $searchResults[] = array(
            "contact_id" => intval($row["contact_id"]),
            "c_name" => $row["c_name"],
            "phone" => $row["phone"],
            "email" => $row["email"]
        );
    }

    if (count($searchResults) == 0)
    {
        returnWithError("No Records Found");
    }
    else
    {
        returnWithInfo($searchResults);
    }

    $stmt->close();
    $conn->close();


    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj)
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err)
    {
        $retValue = array(
            "results" => array(),
            "error" => $err
        );

        sendResultInfoAsJson(json_encode($retValue));
    }

    function returnWithInfo($searchResults)
    {
        $retValue = array(
            "results" => $searchResults,
            "error" => ""
        );

        sendResultInfoAsJson(json_encode($retValue));
    }
?>
