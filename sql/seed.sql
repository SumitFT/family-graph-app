insert into persons (display_name, sex, birth_city, current_city, profession) values
 ('Asha Gupta','female','Mumbai','Pune','Doctor'),
 ('Ravi Sharma','male','Delhi','Mumbai','Engineer'),
 ('Meera Sharma','female','Delhi','Delhi','Teacher'),
 ('Karan Sharma','male','Pune','Pune','Designer'),
 ('Anita Verma','female','Jaipur','Jaipur','Lawyer');

-- Parent: Ravi -> Karan
insert into relationships (from_person_id, to_person_id, type)
select p1.id, p2.id, 'parent' from persons p1, persons p2 where p1.display_name='Ravi Sharma' and p2.display_name='Karan Sharma' limit 1;

-- Spouses: Ravi ↔ Meera
do $$
declare a uuid; b uuid;
begin
  select id into a from persons where display_name='Ravi Sharma' limit 1;
  select id into b from persons where display_name='Meera Sharma' limit 1;
  if a is not null and b is not null then
    insert into relationships (from_person_id, to_person_id, type) values (a,b,'spouse');
  end if;
end$$;
