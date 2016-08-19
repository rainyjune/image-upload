<?php
$response = array('success'=> false, 'msg' => 'Unknown error');
if (isset($_FILES['myFile'])) {
  $filename = "./uploads/" . $_FILES['myFile']['name'];
  move_uploaded_file($_FILES['myFile']['tmp_name'], $filename);
  $response = array('success'=> true, 'msg' => 'success', 'url' => $filename);
}
echo json_encode($response);