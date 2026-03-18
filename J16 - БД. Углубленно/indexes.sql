show data_directory;
SELECT * FROM pg_catalog.pg_tablespace;
SELECT relfilenode , oid, relname
FROM pg_class;

/* Таблица с индексами */
drop table if exists rnd.orders_indexed;
create table rnd.orders_indexed (
	uuid UUID not null primary key default gen_random_uuid(),
	id bigint generated always as identity,
    status varchar(50) not null,
    customer_id bigint not null,
	amount numeric(18, 2) null,
	created_at timestamp not null default CURRENT_TIMESTAMP,
	updated_at timestamp not null default CURRENT_TIMESTAMP
);
-- Добавляем много разных индексов
create unique index idx_orders_id on orders_indexed(id);
create index idx_orders_customer on orders_indexed using hash (customer_id);
create index idx_orders_status on orders_indexed(status, created_at);
create index idx_orders_amount on orders_indexed(amount);

-- Заполняем таблицу случайными данными
-- Имитируем множество отдельных вставок и удалений
do $$
	declare created timestamp;
begin
FOR i IN 1..500000 loop
	-- Несколько новых
	select
		('2020-01-01'::date + (i + random()) * 20 * interval '1 second')
	into created;
    insert into rnd.orders_indexed
		(status, customer_id, amount, created_at, updated_at)
    select
    		case
	    		when x % 13 = 0 then 'canceled'
	    		when x % 3 = 0 and i >= 9000 then 'new'
			when x % 4 = 0 and i < 500  then 'archived'
	    		else 'ready'
    		end as status
    		, (random() * 100)::bigint as customer_id
    		, case when random() > 0.01
			then (random() * 10000000)::numeric(18, 2)
		end as amount
		, created + x * interval '1 second'
		as created_at
		, case when random() < 0.25
			then created + x * interval '1 second' + random() * interval '1 year'
		    else created + x * interval '1 second'
		end as updated_at
    from generate_series(1, 20) as r(x);
	-- Удаляем случайную
	delete from rnd.orders_indexed
	where id = (select (random() * max(id))::bigint from rnd.orders_indexed);
END LOOP;
end;
$$;

-- Обновление статуса заказа
UPDATE rnd.orders_indexed 
SET status = 'ready',
    updated_at = CURRENT_TIMESTAMP
WHERE customer_id = 2 
  AND status = 'new';

-- Массовое обновление статусов
UPDATE rnd.orders_indexed 
SET status = 'test',
    updated_at = CURRENT_TIMESTAMP
WHERE created_at < NOW() - INTERVAL '3 months' 
  AND status = 'ready';


/* Копия таблицы без индексов */
drop table if exists rnd.orders_copy_plain;
create table rnd.orders_copy_plain (
	uuid UUID not null,
	id bigint not null,
    status varchar(50) not null,
    customer_id bigint not null,
	amount numeric(18, 2) null,
	created_at timestamp not null,
	updated_at timestamp not null
);

insert into rnd.orders_copy_plain (
	uuid,
	id,
    status,
    customer_id,
	amount,
	created_at,
	updated_at
)
select 
	uuid,
	id,
    status,
    customer_id,
	amount,
	created_at,
	updated_at
from rnd.orders_indexed;


/* Копия таблицы c индексами */
drop table if exists rnd.orders_copy_index;
create table rnd.orders_copy_index (
	uuid UUID not null primary key default gen_random_uuid(),
	id bigint not null,
    status varchar(50) not null,
    customer_id bigint not null,
	amount numeric(18, 2) null,
	created_at timestamp not null default CURRENT_TIMESTAMP,
	updated_at timestamp not null default CURRENT_TIMESTAMP
);
create unique index idx_orders_copy_id on orders_copy_index(id);
create index idx_orders_copy_customer on orders_copy_index using hash (customer_id);
create index idx_orders_copy_status on orders_copy_index(status, created_at);
create index idx_orders_copy_amount on orders_copy_index(amount);

insert into rnd.orders_copy_index (
	uuid,
	id,
    status,
    customer_id,
	amount,
	created_at,
	updated_at
)
select 
	uuid,
	id,
    status,
    customer_id,
	amount,
	created_at,
	updated_at
from rnd.orders_indexed;



/* Копия таблицы c индексами после заполнения */
drop table if exists rnd.orders_copy_index_after;
create table rnd.orders_copy_index_after (
	uuid UUID not null primary key default gen_random_uuid(),
	id bigint not null,
    status varchar(50) not null,
    customer_id bigint not null,
	amount numeric(18, 2) null,
	created_at timestamp not null default CURRENT_TIMESTAMP,
	updated_at timestamp not null default CURRENT_TIMESTAMP
);

insert into rnd.orders_copy_index_after (
	uuid,
	id,
    status,
    customer_id,
	amount,
	created_at,
	updated_at
)
select 
	uuid,
	id,
    status,
    customer_id,
	amount,
	created_at,
	updated_at
from rnd.orders_indexed;

create unique index idx_orders_copy_after_id on orders_copy_index_after(id);
create index idx_orders_copy_after_customer on orders_copy_index_after using hash (customer_id);
create index idx_orders_copy_after_status on orders_copy_index_after(status, created_at);
create index idx_orders_copy_after_amount on orders_copy_index_after(amount);

/* Запросы с и без индексов */

explain analyze select created_at::Date
, status
, sum(amount) as amount
, sum(sum(amount)) over (partition by created_at::Date) as total_day_amount
, max(updated_at) as last_updated_at
from rnd.orders_indexed o
where o.customer_id in (16, 32, 64)
	and o.status in ('ready', 'canceled')
	and o.amount > 10000
group by created_at::Date, status
order by last_updated_at desc;


explain analyze select created_at::Date
, status
, sum(amount) as amount
, sum(sum(amount)) over (partition by created_at::Date) as total_day_amount
, max(updated_at) as last_updated_at
from rnd.orders_copy_plain o
where o.customer_id in (16, 32, 64)
	and o.status in ('ready', 'canceled')
	and o.amount > 10000
group by created_at::Date, status
order by last_updated_at desc;
