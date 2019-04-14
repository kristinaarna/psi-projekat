<?php
  class GetUserData extends Query{
    public function query($pdo, $args){
      $st = $pdo->prepare('
        select idUser from User
        where nick = ?
      ');
      $st->execute([$args->nick]);
      $id = $st->fetchColumn();

      if($id === false){
        $this->err('404');
        return;
      }

      $id = (int)$id;
      $st = $pdo->prepare('
        select
          if(U.displayEmail = 1, email, null) as email,
          isMod,
          registrationDate,
          fullName,
          description
        from User U
        where idUser = ?
      ');
      $st->execute([$id]);

      $this->succ($st->fetch());
    }
  }

  new GetUserData();
?>