<?php
  function getParams(){
    $stdin = fopen('php://stdin', 'r');
    $str = fgets($stdin);
    fclose($stdin);
    return json_decode($str);
  }

  $ps = getParams();
?>