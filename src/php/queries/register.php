<?php
  require_once('../prepare.php');

  $sth = $db->prepare('
    select count(*) from User
    where nick = ?
  ');
  $sth->execute([$ps->nick]);
  $num = (int)$sth->fetchColumn();

  if($num === 0){
    $db->prepare('
      insert into User (
        nick,
        email,
        isMod
      ) values (?, ?, b?);
    ')->execute([
      $ps->nick,
      $ps->email,
      $ps->isMod,
    ]);

    echo(1);
  }else{
    echo(0);
  }

  require_once('../cleanup.php');
?>