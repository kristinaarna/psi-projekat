<?php
  class GetCompetitions extends Query{
    public function query($pdo, $args){
      if($args->token === null){
        $st = $pdo->prepare('
          select idComp as id, title, description as `desc`, startDate as date, 0 as applied
          from Competition
        ');
        $st->execute();
        $this->succ($st->fetchAll());
        return;
      }

      $st = $pdo->prepare('
        select idUser from User
        where token = ?
      ');
      $st->execute([$args->token]);
      $id = $st->fetchColumn();

      if($id === false){
        $this->err('data');
        return;
      }

      $st = $pdo->prepare('
        select idComp as id, title, description as `desc`, startDate as date, (
          select count(*) from Participating
          where user = ? and comp = C.idComp
        ) as applied
        from Competition C
        order by startDate desc
      ');
      $st->execute([$id]);
      $this->succ($st->fetchAll());
    }
  }

  new GetCompetitions();
?>