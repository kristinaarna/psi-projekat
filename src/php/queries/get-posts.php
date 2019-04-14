<?php
  class GetPosts extends Query{
    public function query($pdo, $args){
      $st = $pdo->prepare('
        select (
          select nick from User
          where idUser = postedBy
        ) as user, creationDate as date, content
        from Post
        order by creationDate desc
      ');
      $st->execute();
      $this->succ($st->fetchAll());
    }
  }

  new GetPosts();
?>