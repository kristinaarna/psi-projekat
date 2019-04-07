<?php
  function getPDO(){
    $host = 'localhost';
    $user = 'root';
    $pass = '';
    $dbName = 'psi-projekat';

    $pdo = new PDO('mysql:host=' . $host . ';dbname=' . $dbName, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    return $pdo;
  }

  $db = getPDO();
?>