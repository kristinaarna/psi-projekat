<?php
  class Register extends Query{
    public function query($pdo, $args){
      $sth = $pdo->prepare('
        select count(*) from User
        where nick = ?
      ');
      $sth->execute([$args->nick]);
      $num = (int)$sth->fetchColumn();

      if($num === 0){
        $pdo->prepare('
          insert into User (
            nick,
            email,
            passHash,
            isMod
          ) values (?, ?, ?, false)
        ')->execute([
          $args->nick,
          $args->email,
          $args->passHash,
        ]);

        $this->succ();
      }else{
        $this->err('nickExists');
      }
    }
  }

  new Register();
?>